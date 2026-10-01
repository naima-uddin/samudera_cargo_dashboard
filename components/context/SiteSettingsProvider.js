'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { getSiteSettings } from '@/services/siteSettings';

// localStorage key holding the last successfully fetched settings, so a reload
// can paint the uploaded logo/favicon immediately instead of flashing defaults.
const CACHE_KEY = 'siteSettingsCache';

// useLayoutEffect on the client (runs before paint → no visible flash),
// useEffect on the server (avoids the SSR warning).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Fallback defaults so the dashboard never renders empty identity/contact info.
export const DEFAULT_SETTINGS = {
  logo: 'https://samudera-cargo-server.vercel.app/uploads/logo.png',
  favicon: '',
  companyName: 'Samudera Traffic Co., Ltd.',
  phone: '+66977830395',
  whatsapp: '66977830395',
  email: 'info@samuderathai.com',
  address:
    'Green Tower, 9th floor, 3656/27-28 Rama IV Road, Klongton-Klong Toey, Bangkok 10110, Thailand',
  fax: '',
};

const SiteSettingsContext = createContext(DEFAULT_SETTINGS);

export const useSiteSettings = () => useContext(SiteSettingsContext);

export default function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Before the browser paints, hydrate from the cached settings so a reload
  // shows the uploaded logo/favicon straight away — no default-then-swap flash.
  // Starting state stays DEFAULT so it matches the server-rendered HTML (no
  // hydration mismatch); this runs right after and updates before paint.
  useIsoLayoutEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(cached) });
      }
    } catch (e) {
      /* ignore corrupt cache */
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await getSiteSettings();
      if (active && res.success && res.data) {
        const merged = { ...DEFAULT_SETTINGS };
        Object.keys(DEFAULT_SETTINGS).forEach((key) => {
          const val = res.data[key];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            merged[key] = val;
          }
        });
        setSettings(merged);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        } catch (e) {
          /* storage full/unavailable — non-fatal */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Apply favicon to the document head whenever it changes.
  // IMPORTANT: never removeChild() the icon <link>s Next.js manages (from
  // app/favicon.ico) — deleting React-owned head nodes corrupts React's DOM
  // tree and later crashes route transitions with "Cannot read properties of
  // null (reading 'removeChild')". Instead we own a single tagged <link> and
  // only ever mutate that one.
  useEffect(() => {
    if (typeof document === 'undefined' || !settings.favicon) return;
    const head = document.head;
    let link = head.querySelector("link[data-site-favicon='true']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.setAttribute('data-site-favicon', 'true');
      head.appendChild(link);
    }
    link.href = settings.favicon;
  }, [settings.favicon]);

  // Keep the browser-tab title in sync with the dashboard's configured name.
  useEffect(() => {
    if (typeof document !== 'undefined' && settings.companyName) {
      document.title = settings.companyName;
    }
  }, [settings.companyName]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
