'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineCog, HiOutlinePhotograph, HiOutlineTrash } from 'react-icons/hi';
import { getSiteSettings, updateSiteSettings } from '@/services/siteSettings';
import { getAuthToken } from '@/utils/SessionHelper';
import { useRouter } from 'next/navigation';

const EMPTY = {
  logo: '',
  favicon: '',
  companyName: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  fax: '',
};

const MAX_LOGO_BYTES = 20 * 1024 * 1024; // 20MB source image
const MAX_FAVICON_BYTES = 20 * 1024 * 1024; // 20MB favicon

// The logo/favicon are stored as base64 inside the site-settings document,
// which is fetched on EVERY page load of both the public site and dashboard.
// So we downscale the picked image in the browser before saving: the admin can
// pick a big file, but only a small, fast image ever hits the DB/network.
// PNG output preserves transparency (important for logos).
const resizeImageToDataURL = (file, maxDimension) =>
  new Promise((resolve, reject) => {
    // SVG is already tiny and vector — keep as-is.
    if (file.type === 'image/svg+xml') {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.onerror = () => reject(new Error('Failed to read image'));
      r.readAsDataURL(file);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });

export default function SiteSettingsForm() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/');
      return;
    }

    (async () => {
      const res = await getSiteSettings();
      if (res.success && res.data) {
        setForm({ ...EMPTY, ...res.data });
      } else {
        toast.error(res.message || 'Failed to load settings');
      }
      setLoading(false);
    })();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error('Image is too large. Please use an image under 20MB.');
      return;
    }

    try {
      // Downscale the logo to max 512px so the stored/served image stays small.
      const dataUrl = await resizeImageToDataURL(file, 512);
      setForm((prev) => ({ ...prev, logo: dataUrl }));
    } catch (err) {
      toast.error('Failed to process the image');
    }
  };

  const removeLogo = () => {
    setForm((prev) => ({ ...prev, logo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFaviconSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isIco = file.type === 'image/x-icon' || file.name.endsWith('.ico');
    const okType = file.type.startsWith('image/') || isIco;
    if (!okType) {
      toast.error('Please select an image (PNG/ICO/SVG)');
      return;
    }
    if (file.size > MAX_FAVICON_BYTES) {
      toast.error('Favicon is too large. Please use an image under 20MB.');
      return;
    }

    try {
      if (isIco) {
        // .ico can't be drawn to canvas reliably — store as-is (already small).
        const r = new FileReader();
        r.onloadend = () => setForm((prev) => ({ ...prev, favicon: r.result }));
        r.onerror = () => toast.error('Failed to read the image');
        r.readAsDataURL(file);
      } else {
        // Downscale favicon to 64px — plenty for a browser tab icon.
        const dataUrl = await resizeImageToDataURL(file, 64);
        setForm((prev) => ({ ...prev, favicon: dataUrl }));
      }
    } catch (err) {
      toast.error('Failed to process the image');
    }
  };

  const removeFavicon = () => {
    setForm((prev) => ({ ...prev, favicon: '' }));
    if (faviconInputRef.current) faviconInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const t = toast.loading('Saving settings...');
    const res = await updateSiteSettings(form);
    toast.dismiss(t);
    if (res.success) {
      toast.success('Site settings updated successfully');
      if (res.data) setForm({ ...EMPTY, ...res.data });
    } else {
      toast.error(res.message || 'Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <HiOutlineCog className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Site Settings</h1>
          <p className="text-sm text-gray-500">
            Control the logo & contact info shown across the public website.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6"
      >
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-28 h-20 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
              {form.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <HiOutlinePhotograph className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {form.logo && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                >
                  <HiOutlineTrash className="w-4 h-4" /> Remove logo
                </button>
              )}
              <p className="text-xs text-gray-400">PNG/JPG/SVG, up to 20MB. Auto-optimized for fast loading. Transparent PNG recommended.</p>
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Favicon (browser tab icon)</label>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
              {form.favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.favicon} alt="Favicon preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <HiOutlinePhotograph className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*,.ico"
                onChange={handleFaviconSelect}
                className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {form.favicon && (
                <button
                  type="button"
                  onClick={removeFavicon}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                >
                  <HiOutlineTrash className="w-4 h-4" /> Remove favicon
                </button>
              )}
              <p className="text-xs text-gray-400">Square PNG/ICO, ideally 32×32 or 64×64. Auto-optimized on upload.</p>
            </div>
          </div>
        </div>

        {/* Company name */}
        <Field label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Samudera Traffic Co., Ltd." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+66977830395" />
          <Field label="WhatsApp Number" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="66977830395" hint="Digits only, no +" />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="info@example.com" />
          <Field label="Fax" name="fax" value={form.fax} onChange={handleChange} placeholder="Optional" />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address / Head Office</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder="Full head office address"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm resize-none"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
