'use client';

import { useEffect, useState, useRef } from 'react';
import { Package, Heart, ArrowRight, Loader2, Search, CheckCircle2, Truck, Clock, AlertCircle, Camera, User, LogOut, Wallet, Star, Settings, MapPin, Trophy } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAppStore } from '@/store';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import AccountModal from '@/components/account/AccountModal';
import AddressSettings from '@/components/account/modals/AddressSettings';
import PrivacySettings from '@/components/account/modals/PrivacySettings';
import NotificationSettings from '@/components/account/modals/NotificationSettings';

type RecentOrder = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
};

export default function AccountOverviewPage() {
  const router = useRouter();
  const t = useTranslations('Account');
  const tw = useTranslations('Wallet');
  const { user, wishlist, logout } = useAppStore();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  
  // Profile Picture State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [activeModal, setActiveModal] = useState<'addresses' | 'privacy' | 'notifications' | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchAccountData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Load Avatar URL
      if (authUser.user_metadata?.avatar_url) {
        setAvatarUrl(authUser.user_metadata.avatar_url);
      }

      // Fetch Wallet & Loyalty Data
      const { data: userData } = await supabase
        .from('users')
        .select('wallet_balance, loyalty_points')
        .eq('id', authUser.id)
        .single();
      
      if (userData) {
        setWalletBalance(userData.wallet_balance || 0);
        setLoyaltyPoints(userData.loyalty_points || 0);
      }

      // Fetch Recent Orders
      const { data, error, count } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount', { count: 'exact' })
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setOrders(data);
        setOrderCount(count || data.length);
      }
      setLoading(false);
    };

    fetchAccountData();
  }, [supabase]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);

    try {
      let queryId = trackingId.trim();
      if (queryId.startsWith('GL-')) {
        queryId = queryId.replace('GL-', '');
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, status, created_at, total_amount')
        .or(`id.eq.${queryId},id.ilike.${queryId}%`)
        .single();

      if (error || !data) {
        setTrackingError(t('orderNotFound'));
      } else {
        setTrackingResult(data);
      }
    } catch (err) {
      setTrackingError(t('trackingError'));
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not logged in");

      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', authUser.id);
      setAvatarUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
      alert('Error uploading image. Please ensure avatars bucket exists and is public.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/login');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'shipped': return <Truck className="text-blue-500" size={20} />;
      case 'processing': return <Clock className="text-amber-500" size={20} />;
      default: return <AlertCircle className="text-gray-400" size={20} />;
    }
  };

  const displayName = user?.name || t('customer');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-lg mx-auto bg-white dark:bg-[#221013] shadow-2xl overflow-x-hidden font-display animate-in fade-in duration-700 pb-20">
      {/* Redundant Header removed as it's in the global layout */}


      {/* Profile Section */}
      <div className="flex flex-col items-center py-8 px-6">
        <div className="relative">
          <div className="pink-glow gold-border rounded-full p-1 bg-white relative">
            <div className="relative aspect-square rounded-full h-32 w-32 border-4 border-white overflow-hidden bg-slate-50 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-slate-300">{initial}</span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gold-luxury" />
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-1 right-1 bg-gold-luxury rounded-full p-1.5 border-2 border-white text-white shadow-lg hover:scale-110 transition-all cursor-pointer"
            title="Edit Profile"
          >
            <span className="material-symbols-outlined text-xs block" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} title="Upload Profile Picture" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{displayName}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">
            {t('diamondMember')}
          </p>
        </div>
      </div>

      {/* Stats Cards (Restored from new design) */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{t('totalOrders')}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{orderCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{t('likedProducts')}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{wishlist.length}</p>
        </div>
      </div>

      {/* Loyalty Card / Wallet */}
      <div className="px-6 mb-8">
        <Link href="/account/loyalty">
          <div className="relative overflow-hidden rounded-xl bg-blush-luxury p-6 shadow-sm border border-pink-100 dark:bg-pink-900/10 dark:border-pink-900/20 group cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-[#ee2b4b]">
              <Trophy className="size-16" />
            </div>
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#ee2b4b]/60 uppercase">{t('loyaltyPoints')}</p>
                <h3 className="text-3xl font-black gold-gradient-text mt-1">
                  {loyaltyPoints !== null ? loyaltyPoints.toLocaleString() : '0'}
                </h3>
              </div>
              <button className="bg-white/80 dark:bg-black/20 backdrop-blur-sm gold-border px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:bg-gold-luxury hover:text-white transition-colors">
                {t('redeem')}
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* Menu List */}
      <div className="px-6 space-y-2 flex-1">
        <Link href="/account/orders" title={t('orders')} className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-slate-800 dark:text-white">shopping_bag</span>
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">{t('orders')}</span>
          </div>
          <span className="material-symbols-outlined text-gold-luxury text-lg">chevron_right</span>
        </Link>

        <Link href="/account/loyalty" title={t('loyaltyPoints')} className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <Star className="text-slate-800 dark:text-white size-5" />
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">{t('loyaltyPoints')}</span>
          </div>
          <span className="material-symbols-outlined text-gold-luxury text-lg">chevron_right</span>
        </Link>

        <Link href="/account/wallet" title={tw('title')} className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <Wallet className="text-slate-800 dark:text-white size-5" />
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">{tw('title')}</span>
          </div>
          <span className="material-symbols-outlined text-gold-luxury text-lg">chevron_right</span>
        </Link>

        <button 
          onClick={() => setActiveModal('addresses')}
          className="w-full group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-slate-800 dark:text-white">local_shipping</span>
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">{t('savedAddresses')}</span>
          </div>
          <span className="material-symbols-outlined text-gold-luxury text-lg">chevron_right</span>
        </button>

        <Link href="/account/wishlist" title={t('favoriteProducts')} className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-slate-800 dark:text-white">favorite</span>
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">{t('favoriteProducts')}</span>
          </div>
          <span className="material-symbols-outlined text-gold-luxury text-lg">chevron_right</span>
        </Link>

        <button 
          onClick={() => setActiveModal('privacy')}
          className="w-full group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-slate-800 dark:text-white">lock</span>
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">{t('privacy')}</span>
          </div>
          <span className="material-symbols-outlined text-gold-luxury text-lg">chevron_right</span>
        </button>

        <button 
          onClick={() => setActiveModal('notifications')}
          className="w-full group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-slate-800 dark:text-white">notifications</span>
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">{t('notifications')}</span>
          </div>
          <span className="material-symbols-outlined text-gold-luxury text-lg">chevron_right</span>
        </button>
      </div>

      {/* Logout */}
      <div className="p-8 mt-4">
        <button 
          onClick={handleSignOut}
          className="w-full bg-blush-luxury dark:bg-pink-900/20 py-4 rounded-xl border border-pink-200 dark:border-pink-900/30 shadow-sm flex items-center justify-center gap-2 group active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-gold-luxury font-bold">logout</span>
          <span className="text-gold-luxury font-bold uppercase tracking-[0.2em] text-sm">{t('signOut')}</span>
        </button>
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={activeModal === 'addresses'}
        onClose={() => setActiveModal(null)}
        title={t('savedAddresses')}
      >
        <AddressSettings />
      </AccountModal>

      <AccountModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title={t('privacy')}
      >
        <PrivacySettings />
      </AccountModal>

      <AccountModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        title={t('notifications')}
      >
        <NotificationSettings />
      </AccountModal>

    </div>
  );
}
