'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Loader2, Calendar, History, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getCurrencyUnit } from '@/utils/format';


type Transaction = {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
};

export default function WalletPage() {
  const t = useTranslations('Wallet');
  const locale = useLocale();
  const [balance, setBalance] = useState<number | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchWalletData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Balance
      const { data: userData } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (userData) {
        setBalance(userData.wallet_balance || 0);
      }

      // Fetch Transactions
      const { data: transData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transData) {
        setTransactions(transData);
      }

      setLoading(false);
    };

    fetchWalletData();
  }, [supabase]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-white dark:bg-[#221013] shadow-2xl overflow-x-hidden font-display animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center p-6 justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#221013] sticky top-0 z-50">
        <button onClick={() => window.history.back()} className="flex size-10 shrink-0 items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </button>
        <h2 className="text-xl font-bold tracking-tight uppercase">{t('title')}</h2>
        <div className="size-10"></div>
      </div>

      {/* Hero Balance Card */}
      <div className="px-6 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#221013] to-[#3a1c21] p-8 text-white shadow-2xl pink-glow">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[8rem]">payments</span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/50 uppercase mb-2">{t('availableBalance')}</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-5xl font-black gold-gradient-text">
                {balance !== null ? balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
              </h1>
              <span className="text-sm font-bold text-white/30 uppercase tracking-widest">{getCurrencyUnit(locale)}</span>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button className="flex-1 bg-white text-[#221013] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold-luxury hover:text-white transition-all active:scale-95 shadow-lg">
                <span className="material-symbols-outlined">add_circle</span>
                <span className="uppercase tracking-widest text-xs">{t('topUp')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t('transactionHistory')}</h3>
          <span className="material-symbols-outlined text-gold-luxury">history</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold-luxury mb-4" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t('loadingTransactions')}</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:bg-white dark:hover:bg-white/10 transition-all cursor-default">
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} dark:bg-opacity-10`}>
                    <span className="material-symbols-outlined">
                      {tx.type === 'credit' ? 'trending_up' : 'trending_down'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-medium">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)}
                  </p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{getCurrencyUnit(locale)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
            <div className="size-20 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-slate-200">history_toggle_off</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">{t('noTransactions')}</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-8 mt-4">
        <div className="p-6 rounded-2xl bg-blush-luxury dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary-luxury">verified_user</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#ee2b4b]">{t('secureTransactions')}</h4>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
            {t('secureTransactionsDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
