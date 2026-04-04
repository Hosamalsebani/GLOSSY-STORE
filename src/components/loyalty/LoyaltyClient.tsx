'use client';

import { useEffect, useState } from 'react';
import { 
  Trophy, 
  History, 
  Gift, 
  Info, 
  Loader2, 
  CheckCircle2, 
  Star,
  UserPlus,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

type LoyaltyHistory = {
  id: string;
  points: number;
  type: 'earned' | 'used' | 'bonus';
  reason: string;
  created_at: string;
};

type LoyaltyReward = {
  id: string;
  name_en: string;
  name_ar: string;
  points_required: number;
  reward_type: 'discount' | 'free_product';
  value: number;
};

interface LoyaltyClientProps {
  locale: string;
}

export default function LoyaltyClient({ locale }: LoyaltyClientProps) {
  const t = useTranslations('Loyalty');
  const [points, setPoints] = useState<number | null>(null);
  const [history, setHistory] = useState<LoyaltyHistory[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const supabase = createClient();

  const [settings, setSettings] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch points
      const { data: userData } = await supabase
        .from('users')
        .select('loyalty_points')
        .eq('id', user.id)
        .single();
      
      if (userData) setPoints(userData.loyalty_points || 0);

      // Fetch history
      const { data: historyData } = await supabase
        .from('loyalty_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (historyData) setHistory(historyData);

      // Fetch active rewards
      const { data: rewardsData } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('active', true)
        .order('points_required', { ascending: true });
      
      if (rewardsData) setRewards(rewardsData);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('loyalty_settings')
        .select('*');
      
      if (settingsData) {
        const settingsMap: Record<string, number> = {};
        settingsData.forEach(s => settingsMap[s.key] = s.value);
        setSettings(settingsMap);
      }

      setLoading(false);
    };

    fetchLoyaltyData();
  }, [supabase]);

  const handleRedeem = async (reward: LoyaltyReward) => {
    if (points === null || points < reward.points_required) return;
    
    setRedeeming(reward.id);
    try {
      const { data: couponCode, error: rpcError } = await supabase.rpc('redeem_loyalty_reward', {
        p_reward_id: reward.id
      });

      if (rpcError) throw rpcError;

      setPoints(points - reward.points_required);
      setSuccessCode(couponCode);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: newHistory } = await supabase
          .from('loyalty_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (newHistory) setHistory(newHistory);
      }

    } catch (error) {
      console.error('Redemption error:', error);
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="size-12 animate-spin text-[#221013]" />
        <p className="mt-4 text-slate-500">{t('loading')}</p>
      </div>
    );
  }

  const earnRules = [
    { icon: <UserPlus />, label: t('earnSignup'), points: settings.signup_bonus || 50 },
    { icon: <ShoppingBag />, label: t('earnPurchase'), points: `1:${settings.points_per_unit || 1}` },
    { icon: <MessageSquare />, label: t('earnReview'), points: settings.review_bonus || 20 },
    { icon: <UserPlus />, label: t('earnReferral'), points: settings.referral_bonus || 100 },
    { icon: <Gift />, label: 'استرداد النقاط (Redemption)', points: `${settings.points_redemption_rate || 10}:1` },
  ];

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-white dark:bg-[#221013] shadow-2xl overflow-x-hidden font-display animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex items-center p-6 justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#221013] sticky top-0 z-50">
        <button onClick={() => window.history.back()} className="flex size-10 shrink-0 items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </button>
        <h2 className="text-xl font-bold tracking-tight uppercase">{t('title')}</h2>
        <div className="size-10"></div>
      </div>

      {/* Points Summary Card */}
      <div className="px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#221013] to-[#3a1c21] p-8 text-white shadow-2xl pink-glow"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="size-32" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{t('pointsBalance')}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-6xl font-black">{points}</span>
              <span className="text-xl font-medium opacity-60 uppercase">{t('points')}</span>
            </div>
            
            {/* Progress to next milestone */}
            {(() => {
              const nextReward = rewards.find(r => r.points_required > (points || 0));
              const milestone = nextReward ? nextReward.points_required : (rewards[rewards.length - 1]?.points_required || 200);
              const isMaxed = !nextReward && (points || 0) >= milestone;

              return (
                <div className="mt-8">
                  <div className="flex justify-between text-xs mb-2 opacity-80 uppercase tracking-wider">
                    <span>{isMaxed ? 'Max Level Reached' : 'Next Milestone'}</span>
                    <span>{points || 0}/{milestone}</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((points || 0) / milestone * 100, 100)}%` }}
                      className="h-full bg-gradient-to-r from-[#FFD7E4] to-[#FF8FB1]"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successCode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setSuccessCode(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#2e1519] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="size-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('congratulations')}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {t('rewardRedeemed', { code: successCode })}
              </p>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl font-mono text-2xl font-bold tracking-widest border-2 border-dashed border-slate-200 dark:border-white/10 mb-6">
                {successCode}
              </div>
              <button 
                onClick={() => setSuccessCode(null)}
                className="w-full py-4 bg-[#221013] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards Section */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Gift className="size-5 text-[#221013] dark:text-[#FFD7E4]" />
          <h3 className="text-lg font-bold uppercase tracking-tight">{t('redeemRewards')}</h3>
        </div>
        
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <div 
              key={reward.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 dark:border-white/5 p-4 flex items-center justify-between transition-all hover:border-[#FFD7E4] hover:shadow-lg dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-[#FFF5F8] dark:bg-white/5 flex items-center justify-center text-[#221013] dark:text-[#FFD7E4]">
                  {reward.reward_type === 'discount' ? <Star /> : <ShoppingBag />}
                </div>
                <div>
                  <h4 className="font-bold">{locale === 'ar' ? reward.name_ar : reward.name_en}</h4>
                  <p className="text-xs text-slate-500">{reward.points_required} {t('points')}</p>
                </div>
              </div>
              
              <button
                disabled={points === null || points < reward.points_required || redeeming !== null}
                onClick={() => handleRedeem(reward)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  points && points >= reward.points_required 
                  ? 'bg-[#221013] text-white hover:bg-[#3a1c21]' 
                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
              >
                {redeeming === reward.id ? <Loader2 className="size-4 animate-spin" /> : t('redeem')}
              </button>
            </div>
          ))}
          {rewards.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <Gift className="size-12 mx-auto mb-2" />
              <p>No rewards available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* How to Earn */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Info className="size-5 text-[#221013] dark:text-[#FFD7E4]" />
          <h3 className="text-lg font-bold uppercase tracking-tight">{t('howToEarn')}</h3>
        </div>
        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6">
          <div className="grid gap-6">
            {earnRules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400">
                    {rule.icon}
                  </div>
                  <span className="text-sm font-medium">{rule.label}</span>
                </div>
                <span className="text-sm font-bold text-[#221013] dark:text-[#FFD7E4]">+{rule.points} {idx === 1 ? '' : t('points')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="size-5 text-[#221013] dark:text-[#FFD7E4]" />
          <h3 className="text-lg font-bold uppercase tracking-tight">{t('history')}</h3>
        </div>
        
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-full flex items-center justify-center ${
                    item.type === 'earned' ? 'bg-green-100 text-green-600 px-2' : 
                    item.type === 'used' ? 'bg-red-100 text-red-600 px-2' : 
                    'bg-blue-100 text-blue-600 px-2'
                  }`}>
                    {item.type === 'earned' ? '+' : item.type === 'used' ? '-' : '★'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.reason}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                      {new Date(item.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.points > 0 ? `+${item.points}` : item.points}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-30">
              <History className="size-16 mx-auto mb-4" />
              <p className="text-lg font-bold uppercase tracking-widest">{t('noHistory')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
