'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Key, UserX, AlertTriangle, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function PrivacySettings() {
  const t = useTranslations('Account');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const supabase = createClient();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }
    if (password.length < 6) {
      alert(t('passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      alert(t('passwordUpdated'));
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('preferencesError');
      console.error('Error updating password:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t('deleteAccountWarningTitle'));
    if (!confirmed) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        if (error.message.includes('not found')) {
          alert(t('serverSideActionRequired'));
        } else {
          throw error;
        }
      } else {
        await supabase.auth.signOut();
        window.location.href = '/';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('preferencesError');
      console.error('Error deleting account:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-gold-luxury">
            <Key size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t('changePassword')}</h3>
            <p className="text-[10px] text-slate-500 font-medium">{t('updatePasswordDesc')}</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('newPassword')}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-gold-luxury/50 focus:border-gold-luxury outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('confirmPassword')}</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-gold-luxury/50 focus:border-gold-luxury outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield size={16} />}
            {t('updatePassword')}
          </button>
        </form>
      </section>

      <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />

      {/* Delete Account */}
      <section className="space-y-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/10 text-red-500">
            <UserX size={18} />
          </div>
          <div>
            <h3 className="font-bold text-red-500 uppercase tracking-wider text-xs">{t('deleteAccount')}</h3>
            <p className="text-[10px] text-slate-500 font-medium">{t('deleteAccountDesc')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 space-y-3">
          <div className="flex gap-3">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <p className="text-[10px] text-red-600 dark:text-red-400 font-medium leading-relaxed">
              {t('deleteAccountConfirm')}
            </p>
          </div>
        </div>

        <button 
          onClick={handleDeleteAccount}
          disabled={loading}
          className="w-full bg-white dark:bg-white/5 text-red-500 border border-red-100 dark:border-red-500/20 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {t('deleteAccount')}
        </button>
      </section>
    </div>
  );
}
