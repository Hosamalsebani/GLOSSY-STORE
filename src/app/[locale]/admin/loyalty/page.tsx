'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Loader2, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Star, 
  Gift, 
  TrendingUp, 
  Users, 
  Search,
  History,
  Settings,
  ShieldCheck,
  Trophy,
  Cake
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

type Reward = {
  id: string;
  name_en: string;
  name_ar: string;
  points_required: number;
  reward_type: 'discount' | 'free_product';
  value: number;
  active: boolean;
};

type Customer = {
  id: string;
  full_name: string;
  email: string;
  loyalty_points: number;
};

type BirthdayRewardLog = {
  id: string;
  user_id: string;
  points_awarded: number;
  reward_date: string;
  profiles: {
    full_name: string;
  };
};

export default function AdminLoyaltyPage() {
  const t = useTranslations('Admin');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRewardFormOpen, setIsRewardFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [settings, setSettings] = useState<Record<string, number>>({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<Record<string, number>>({});
  
  const [rewardFormData, setRewardFormData] = useState({
    name_en: '',
    name_ar: '',
    points_required: '',
    reward_type: 'discount' as 'discount' | 'free_product',
    value: '',
    active: true
  });

  const [birthdayLogs, setBirthdayLogs] = useState<BirthdayRewardLog[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<Customer | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('Manual adjustment by admin');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: rewardsData } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .order('points_required', { ascending: true });
      
      if (rewardsData) setRewards(rewardsData);

      const { data: customersData } = await supabase
        .from('users')
        .select('id, full_name, email, loyalty_points')
        .order('loyalty_points', { ascending: false })
        .limit(10);
      
      if (customersData) setCustomers(customersData);

      const { data: bLogData } = await supabase
        .from('birthday_rewards_log')
        .select('*, profiles:users(full_name)')
        .order('reward_date', { ascending: false })
        .limit(10);
      
      if (bLogData) setBirthdayLogs(bLogData as any);

      const { data: settingsData } = await supabase
        .from('loyalty_settings')
        .select('*');
      
      if (settingsData) {
        const settingsMap: Record<string, number> = {};
        settingsData.forEach(s => settingsMap[s.key] = s.value);
        setSettings(settingsMap);
      }

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, loyalty_points')
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(10);
    if (data) setCustomers(data);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name_en: rewardFormData.name_en,
        name_ar: rewardFormData.name_ar,
        points_required: Number(rewardFormData.points_required),
        reward_type: rewardFormData.reward_type,
        value: Number(rewardFormData.value),
        active: rewardFormData.active
      };

      if (editingReward) {
        await supabase.from('loyalty_rewards').update(payload).eq('id', editingReward.id);
      } else {
        await supabase.from('loyalty_rewards').insert(payload);
      }

      setIsRewardFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('loyalty_rewards').delete().eq('id', id);
    fetchData();
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const updates = Object.entries(tempSettings).map(([key, value]) => ({
        key,
        value: Number(value)
      }));

      const { error } = await supabase.from('loyalty_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;

      setIsSettingsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Settings update error:', err);
      alert(`Error: ${err.message || 'Failed to update settings'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!adjustingUser || !adjustmentAmount) return;
    setIsLoading(true);
    try {
      const newBalance = (adjustingUser.loyalty_points || 0) + Number(adjustmentAmount);
      
      await supabase.from('users').update({ loyalty_points: newBalance }).eq('id', adjustingUser.id);
      
      await supabase.from('loyalty_history').insert({
        user_id: adjustingUser.id,
        points: Number(adjustmentAmount),
        type: Number(adjustmentAmount) > 0 ? 'earned' : 'used',
        reason: adjustmentReason
      });

      setAdjustingUser(null);
      setAdjustmentAmount('');
      setSearchQuery('');
      fetchData();
    } catch (err) {
      console.error('Adjustment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] tracking-tight">{t('loyalty.title')}</h1>
          <p className="text-gray-500 font-light mt-1">{t('loyalty.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            title={t('loyalty.createReward')}
            onClick={() => {
              setEditingReward(null);
              setRewardFormData({
                name_en: '',
                name_ar: '',
                points_required: '',
                reward_type: 'discount',
                value: '',
                active: true
              });
              setIsRewardFormOpen(true);
            }}
            className="bg-[var(--color-luxury-black)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>{t('loyalty.createReward')}</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Trophy className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Rewards</p>
            <p className="text-2xl font-black">{rewards.filter(r => r.active).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-pink-50 flex items-center justify-center text-[#ee2b4b]">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Members</p>
            <p className="text-2xl font-black">9</p> {/* Hardcoded for now based on context */}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg. Points</p>
            <p className="text-2xl font-black">450</p>
          </div>
        </div>
      </div>

      {/* Reward Form Overlay */}
      {isRewardFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-serif mb-6">{editingReward ? t('loyalty.editReward') : t('loyalty.createReward')}</h2>
            <form onSubmit={handleSaveReward} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nameEn" className="block text-xs font-bold mb-1 uppercase opacity-50">{t('loyalty.rewardNameEn')}</label>
                  <input 
                    id="nameEn"
                    type="text" required
                    value={rewardFormData.name_en}
                    onChange={e => setRewardFormData({...rewardFormData, name_en: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="nameAr" className="block text-xs font-bold mb-1 uppercase opacity-50">{t('loyalty.rewardNameAr')}</label>
                  <input 
                    id="nameAr"
                    type="text" required
                    value={rewardFormData.name_ar}
                    onChange={e => setRewardFormData({...rewardFormData, name_ar: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pointsReq" className="block text-xs font-bold mb-1 uppercase opacity-50">{t('loyalty.pointsRequired')}</label>
                  <input 
                    id="pointsReq"
                    type="number" required
                    value={rewardFormData.points_required}
                    onChange={e => setRewardFormData({...rewardFormData, points_required: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="rewardType" className="block text-xs font-bold mb-1 uppercase opacity-50">{t('loyalty.rewardType')}</label>
                  <select 
                    id="rewardType"
                    value={rewardFormData.reward_type}
                    onChange={e => setRewardFormData({...rewardFormData, reward_type: e.target.value as any})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl"
                  >
                    <option value="discount">Discount Code</option>
                    <option value="free_product">Free Product</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="rewardValue" className="block text-xs font-bold mb-1 uppercase opacity-50">{t('loyalty.value')}</label>
                <input 
                  id="rewardValue"
                  type="number" required
                  value={rewardFormData.value}
                  onChange={e => setRewardFormData({...rewardFormData, value: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 py-4">
                <input 
                  type="checkbox" id="reward_active"
                  checked={rewardFormData.active}
                  onChange={e => setRewardFormData({...rewardFormData, active: e.target.checked})}
                  className="size-4"
                />
                <label htmlFor="reward_active" className="text-sm font-medium">{t('loyalty.active')}</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsRewardFormOpen(false)}
                  className="flex-1 py-3 border border-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[var(--color-luxury-black)] text-white rounded-xl font-bold"
                >
                  {t('loyalty.saveReward')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rewards List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="size-5" />
            <h2 className="text-xl font-serif">Loyalty Rewards</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">Reward</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rewards.map(reward => (
                  <tr key={reward.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{reward.name_en}</div>
                      <div className="text-[10px] text-gray-400 font-mono uppercase">{reward.reward_type}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{reward.points_required}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {reward.value} {reward.reward_type === 'discount' ? 'LYD OFF' : 'Unit'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          title="Edit Reward"
                          onClick={() => {
                            setEditingReward(reward);
                            setRewardFormData({
                              name_en: reward.name_en,
                              name_ar: reward.name_ar,
                              points_required: reward.points_required.toString(),
                              reward_type: reward.reward_type,
                              value: reward.value.toString(),
                              active: reward.active
                            });
                            setIsRewardFormOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          type="button"
                          title="Delete Reward"
                          onClick={() => handleDeleteReward(reward.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 mb-2 pt-8">
            <Cake className="size-5 text-pink-500" />
            <h2 className="text-xl font-serif">Birthday Reward History</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {birthdayLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{log.profiles?.full_name || 'Anonymous'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded">
                        +{log.points_awarded} Points
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.reward_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {birthdayLogs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                      No birthday rewards issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Management */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-5" />
            <h2 className="text-xl font-serif">Customer Points</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-2">
              {customers.map(customer => (
                <div 
                  key={customer.id} 
                  className="p-3 rounded-xl border border-gray-50 hover:border-[#FFD7E4] transition-all cursor-pointer group"
                  onClick={() => setAdjustingUser(customer)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{customer.full_name || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-rose-600">{customer.loyalty_points || 0}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-300">Points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules Overview */}
          <div className="bg-[#221013] rounded-2xl p-6 text-white shadow-xl pink-glow">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="size-5 text-[#FFD7E4]" />
              <h3 className="font-bold uppercase tracking-widest text-sm">System Rules</h3>
            </div>
            <div className="space-y-3 text-sm opacity-80">
              <div className="flex justify-between">
                <span>Purchase</span> 
                <span>{settings.points_per_unit || 1} pt / 1 LYD</span>
              </div>
              <div className="flex justify-between">
                <span>Signup</span> 
                <span>{settings.signup_bonus || 50} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Review</span> 
                <span>{settings.review_bonus || 20} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Referral</span> 
                <span>{settings.referral_bonus || 100} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Birthday</span> 
                <span>{settings.birthday_bonus || 100} pts</span>
              </div>
              <div className="flex justify-between">
                <span>First Order</span> 
                <span>{settings.first_order_bonus || 100} pts</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-2 font-black text-[#FFD7E4]">
                <span>Redemption</span> 
                <span>{settings.points_redemption_rate || 10} pts = 1 LYD</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setTempSettings(settings);
                setIsSettingsModalOpen(true);
              }}
              className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="size-4" />
              Edit Config
            </button>
          </div>
        </div>

      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">Loyalty Configuration</h2>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus className="size-5 rotate-45" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label className="block text-xs font-black mb-2 uppercase tracking-widest text-[#221013]/60">Points per 1 LYD spent</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" step="0.1"
                    value={tempSettings.points_per_unit || ''}
                    onChange={e => setTempSettings({...tempSettings, points_per_unit: Number(e.target.value)})}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-lg"
                  />
                  <div className="bg-[#221013] text-white px-4 py-3 rounded-xl font-bold text-xs uppercase">Value</div>
                </div>
              </div>

              {[
                { label: 'Signup Bonus Points', key: 'signup_bonus' },
                { label: 'Review Bonus Points', key: 'review_bonus' },
                { label: 'First Order Bonus', key: 'first_order_bonus' },
                { label: 'Referral Bonus', key: 'referral_bonus' },
                { label: 'Birthday Reward Points', key: 'birthday_bonus' },
                { label: 'Points for 1 LYD Discount', key: 'points_redemption_rate' }
              ].map((item) => (
                <div key={item.key} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="block text-xs font-black mb-2 uppercase tracking-widest text-[#221013]/60">{item.label}</label>
                  <input 
                    type="number"
                    value={tempSettings[item.key] || ''}
                    onChange={e => setTempSettings({...tempSettings, [item.key]: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-8 mt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsSettingsModalOpen(false)}
                className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex-[2] py-4 bg-[#221013] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin size-4 mx-auto" /> : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <h3 className="text-xl font-bold mb-2">{t('loyalty.adjustPoints')}</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Customer: {adjustingUser.full_name}</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="adjustAmt" className="block text-xs font-bold mb-1 uppercase opacity-50">{t('loyalty.amount')}</label>
                <input 
                  id="adjustAmt"
                  type="number"
                  placeholder="e.g. 100 or -50"
                  value={adjustmentAmount}
                  onChange={e => setAdjustmentAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="adjustReason" className="block text-xs font-bold mb-1 uppercase opacity-50">{t('loyalty.reason')}</label>
                <input 
                  id="adjustReason"
                  type="text"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button"
                onClick={() => setAdjustingUser(null)}
                className="flex-1 py-3 border border-gray-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleAdjustPoints}
                disabled={!adjustmentAmount || isLoading}
                className="flex-1 py-3 bg-[#221013] text-white rounded-xl font-bold disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin size-4 mx-auto" /> : t('loyalty.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
