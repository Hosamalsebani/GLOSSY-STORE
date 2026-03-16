'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Save, Loader2, Phone, Facebook, Instagram, Music2, Share2 } from 'lucide-react';

type StoreSettings = {
  id: string;
  whatsapp_number: string;
  facebook_url: string;
  instagram_url: string;
  snapchat_url: string;
  tiktok_url: string;
  store_address: string;
  contact_phone: string;
  contact_email: string;
  business_hours: string;
  show_coupon_announcement: boolean;
  free_shipping_threshold: number;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, [supabase]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          whatsapp_number: settings.whatsapp_number,
          facebook_url: settings.facebook_url,
          instagram_url: settings.instagram_url,
          snapchat_url: settings.snapchat_url,
          tiktok_url: settings.tiktok_url,
          store_address: settings.store_address,
          contact_phone: settings.contact_phone,
          contact_email: settings.contact_email,
          business_hours: settings.business_hours,
          show_coupon_announcement: settings.show_coupon_announcement,
          free_shipping_threshold: Number(settings.free_shipping_threshold),
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Store Settings</h1>
        <p className="text-gray-500 text-sm">Manage your contact numbers and social media links that appear on the website and in notifications.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <div className="flex-1">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--color-luxury-black)] uppercase tracking-wider border-b border-gray-100 pb-2">
            Contact Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number (for Order Notifications & Contact)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                value={settings?.whatsapp_number || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, whatsapp_number: e.target.value } : null)}
                placeholder="e.g., +218911234567"
                className="pl-10 w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Include the country code (e.g., +218 for Libya) without spaces or hyphens.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Address
              </label>
              <textarea
                value={settings?.store_address || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, store_address: e.target.value } : null)}
                placeholder="e.g., 123 Fashion Avenue, New York, NY 10001"
                className="w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors min-h-[100px]"
                dir="auto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours
              </label>
              <textarea
                value={settings?.business_hours || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, business_hours: e.target.value } : null)}
                placeholder="e.g., Monday - Friday: 9:00 AM - 6:00 PM EST"
                className="w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors min-h-[100px]"
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone 
              </label>
              <input
                type="text"
                value={settings?.contact_phone || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, contact_phone: e.target.value } : null)}
                placeholder="e.g., +1 (555) 123-4567"
                className="w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings?.contact_email || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, contact_email: e.target.value } : null)}
                placeholder="e.g., support@luxurystore.com"
                className="w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--color-luxury-black)] uppercase tracking-wider border-b border-gray-100 pb-2">
            Social Media Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Facebook className="text-gray-400" size={18} />
                </div>
                <input
                  type="url"
                  value={settings?.facebook_url || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, facebook_url: e.target.value } : null)}
                  placeholder="https://facebook.com/yourpage"
                  className="pl-10 w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Instagram className="text-gray-400" size={18} />
                </div>
                <input
                  type="url"
                  value={settings?.instagram_url || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, instagram_url: e.target.value } : null)}
                  placeholder="https://instagram.com/yourhandle"
                  className="pl-10 w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Snapchat URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Share2 className="text-gray-400" size={18} />
                </div>
                <input
                  type="url"
                  value={settings?.snapchat_url || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, snapchat_url: e.target.value } : null)}
                  placeholder="https://snapchat.com/add/yourhandle"
                  className="pl-10 w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TikTok URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Music2 className="text-gray-400" size={18} />
                </div>
                <input
                  type="url"
                  value={settings?.tiktok_url || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, tiktok_url: e.target.value } : null)}
                  placeholder="https://tiktok.com/@yourhandle"
                  className="pl-10 w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Bar Settings */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--color-luxury-black)] uppercase tracking-wider border-b border-gray-100 pb-2">
            Promotion & Shipping
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-1">Free Shipping Threshold</label>
              <p className="text-xs text-gray-500 mb-3">Minimum order value to qualify for free shipping (0 to disable).</p>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={settings?.free_shipping_threshold || 0}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, free_shipping_threshold: Number(e.target.value) } : null)}
                  className="w-full p-3 border border-gray-200 rounded outline-none focus:border-[var(--color-rose-gold)] transition-colors pr-12"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
                  LYD
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Coupon Announcement</h3>
                <p className="text-xs text-gray-500">Show strongest coupon in banner.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings?.show_coupon_announcement ?? true}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, show_coupon_announcement: e.target.checked } : null)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-luxury-black)] text-white px-8 py-3 rounded uppercase tracking-widest text-sm font-bold hover:bg-[var(--color-rose-gold)] transition-colors active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
