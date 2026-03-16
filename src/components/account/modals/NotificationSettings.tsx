import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Mail, Smartphone, Loader2, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function NotificationSettings() {
  const t = useTranslations('Account');
  const [marketing, setMarketing] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('users')
          .select('marketing_notifications, order_notifications')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setMarketing(data.marketing_notifications ?? true);
          setOrderUpdates(data.order_notifications ?? true);
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [supabase]);

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({
          marketing_notifications: marketing,
          order_notifications: orderUpdates
        })
        .eq('id', user.id);

      if (error) throw error;
      alert(t('preferencesSaved'));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert(t('preferencesError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold-luxury" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-white/10 shadow-sm border border-slate-50 dark:border-white/5 text-gold-luxury">
              <Mail size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{t('marketingEmails')}</p>
              <p className="text-[10px] text-slate-500 font-medium max-w-[200px] leading-tight mt-0.5">{t('marketingEmailsDesc')}</p>
            </div>
          </div>
          <button 
            onClick={() => setMarketing(!marketing)}
            title={t('marketingEmails')}
            aria-label={t('marketingEmails')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${marketing ? 'bg-gold-luxury' : 'bg-slate-200 dark:bg-white/10'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${marketing ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-white/10 shadow-sm border border-slate-50 dark:border-white/5 text-gold-luxury">
              <Smartphone size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{t('orderUpdates')}</p>
              <p className="text-[10px] text-slate-500 font-medium max-w-[200px] leading-tight mt-0.5">{t('orderUpdatesDesc')}</p>
            </div>
          </div>
          <button 
            onClick={() => setOrderUpdates(!orderUpdates)}
            title={t('orderUpdates')}
            aria-label={t('orderUpdates')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${orderUpdates ? 'bg-gold-luxury' : 'bg-slate-200 dark:bg-white/10'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${orderUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-blue-50 dark:border-blue-900/20 bg-blue-50/20 dark:bg-blue-900/10">
        <div className="flex gap-3">
          <Bell size={16} className="text-blue-500 mt-0.5" />
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
            {t('essentialEmailsNote')}
          </p>
        </div>
      </div>

      <button 
        onClick={handleSaveChanges}
        disabled={saving}
        className="w-full bg-gold-luxury text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-gold-luxury/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
        {t('saveChanges')}
      </button>
    </div>
  );
}
