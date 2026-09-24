'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSiteSettings } from '@/services/siteSettings';

// Fallback defaults so the dashboard never renders empty identity/contact info.
export const DEFAULT_SETTINGS = {
  logo: '/logo.png',
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

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
