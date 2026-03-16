'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Plus, Trash2, Edit2, Loader2, X, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type Address = {
  id: string;
  type: string;
  address_line: string;
  is_default: boolean;
};

export default function AddressSettings() {
  const t = useTranslations('Account');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ type: 'Home', address_line: '', is_default: false });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (formData.is_default) {
        // Unset other defaults if this is set as default
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingId) {
        const { error } = await supabase
          .from('user_addresses')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_addresses')
          .insert({ ...formData, user_id: user.id });
        if (error) throw error;
      }

      fetchAddresses();
      setIsAdding(false);
      setEditingId(null);
      setFormData({ type: 'Home', address_line: '', is_default: false });
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({ 
      type: address.type, 
      address_line: address.address_line, 
      is_default: address.is_default 
    });
    setIsAdding(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold-luxury" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {t('manageAddresses')}
        </p>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-gold-luxury hover:text-[#b3942d] transition-colors uppercase tracking-widest"
          >
            <Plus size={14} />
            {t('addNewAddress')}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="p-4 rounded-2xl border border-gold-luxury/20 bg-slate-50 dark:bg-white/5 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('addressType')}</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-luxury"
                title={t('addressType')}
              >
                <option value="Home">{t('home')}</option>
                <option value="Office">{t('office')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_default}
                  onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                  className="rounded border-slate-300 text-gold-luxury focus:ring-gold-luxury"
                  title={t('default')}
                />
                {t('default')}
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('addressLine')}</label>
            <textarea 
              value={formData.address_line}
              onChange={(e) => setFormData({...formData, address_line: e.target.value})}
              required
              placeholder={t('addressPlaceholder')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-luxury min-h-[80px]"
              title={t('addressLine')}
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-gold-luxury text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check size={14} />}
              {editingId ? t('update') : t('save')}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ type: 'Home', address_line: '', is_default: false }); }}
              className="px-4 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <div 
              key={addr.id}
              className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 group hover:border-gold-luxury/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="mt-1 flex items-center justify-center size-8 rounded-full bg-white dark:bg-white/10 shadow-sm border border-slate-50 dark:border-white/5 text-gold-luxury">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                        {addr.type === 'Home' ? t('home') : addr.type === 'Office' ? t('office') : t('other')}
                      </p>
                      {addr.is_default && (
                        <span className="px-2 py-0.5 rounded-full bg-gold-luxury/10 text-gold-luxury text-[8px] font-black uppercase tracking-widest">{t('default')}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {addr.address_line}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(addr)}
                    title="Edit address" 
                    aria-label="Edit address" 
                    className="p-2 text-slate-400 hover:text-gold-luxury transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(addr.id)}
                    title="Delete address" 
                    aria-label="Delete address" 
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          !isAdding && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-slate-50 dark:bg-white/5 mb-4">
                <MapPin size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('noAddresses')}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
