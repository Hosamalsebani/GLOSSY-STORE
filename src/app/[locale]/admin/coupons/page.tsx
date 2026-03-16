'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Edit, AlertCircle, RefreshCcw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

export default function AdminCouponsPage() {
  const t = useTranslations('Admin');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    discount_amount: '',
    expiration_date: '',
    usage_limit: '',
    is_free_shipping: false,
    active: true
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      // NOTE: Expects `coupons` table to exist.
      // If the migration hasn't run, this will error safely.
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        // We set empty array but log the error
        setCoupons([]);
      } else if (data) {
        setCoupons(data);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (coupon: any = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_percentage: coupon.discount_percentage ? coupon.discount_percentage.toString() : '0',
        discount_amount: coupon.discount_amount ? coupon.discount_amount.toString() : '',
        expiration_date: coupon.expiration_date ? new Date(coupon.expiration_date).toISOString().split('T')[0] : '',
        usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : '',
        is_free_shipping: coupon.is_free_shipping || false,
        active: coupon.active
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discount_percentage: '',
        discount_amount: '',
        expiration_date: '',
        usage_limit: '',
        is_free_shipping: false,
        active: true
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload: any = {
        code: formData.code.toUpperCase(),
        discount_percentage: Number(formData.discount_percentage || 0),
        discount_amount: Number(formData.discount_amount || 0),
        is_free_shipping: formData.is_free_shipping,
        active: formData.active
      };

      if (formData.expiration_date) {
        payload.expiration_date = new Date(formData.expiration_date).toISOString();
      } else {
        payload.expiration_date = null;
      }

      if (formData.usage_limit) {
        payload.usage_limit = Number(formData.usage_limit);
      } else {
        payload.usage_limit = null;
      }

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', editingCoupon.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert(payload);
          
        if (error) throw error;
      }

      setIsFormOpen(false);
      fetchCoupons();
    } catch (error: any) {
      console.error('Coupon Save Error:', error);
      
      // Handle Supabase error object structure explicitly
      let errorDetails = '';
      if (error.message) errorDetails += `\nMessage: ${error.message}`;
      if (error.details) errorDetails += `\nDetails: ${error.details}`;
      if (error.hint) errorDetails += `\nHint: ${error.hint}`;
      if (error.code) errorDetails += `\nCode: ${error.code}`;
      
      const finalMsg = errorDetails || JSON.stringify(error, Object.getOwnPropertyNames(error));
      console.log('Processed Error String:', finalMsg);
      alert('Error saving coupon:' + (finalMsg || ' Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon: ' + error.message);
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      fetchCoupons();
    } catch (error: any) {
      console.error('Error toggling coupon status:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] tracking-tight">Smart Coupons</h1>
          <p className="text-gray-500 font-light mt-1">Manage discount codes and promotions</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-[var(--color-luxury-black)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 hover:bg-gray-900 border border-transparent"
        >
          <Plus size={18} />
          <span>Create Coupon</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-[var(--color-luxury-black)]">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input 
                  type="text" 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-transparent transition-all uppercase"
                  placeholder="e.g. SUMMER20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: e.target.value, discount_amount: e.target.value ? '0' : formData.discount_amount})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-transparent transition-all"
                  placeholder="20"
                />
                <p className="text-xs text-gray-400 mt-1">Set to 0 if using fixed amount.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (LYD)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({...formData, discount_amount: e.target.value, discount_percentage: e.target.value ? '0' : formData.discount_percentage})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-transparent transition-all"
                  placeholder="10"
                />
                <p className="text-xs text-gray-400 mt-1">Set to 0 if using percentage.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
                <input 
                  type="date" 
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (Optional)</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-transparent transition-all"
                  placeholder="e.g. 100"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty for unlimited uses.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="is_free_shipping"
                  checked={formData.is_free_shipping}
                  onChange={(e) => setFormData({...formData, is_free_shipping: e.target.checked})}
                  className="w-5 h-5 rounded text-[var(--color-luxury-black)] border-gray-300 focus:ring-[var(--color-luxury-gold)]"
                />
                <label htmlFor="is_free_shipping" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Free Shipping
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-5 h-5 rounded text-[var(--color-luxury-black)] border-gray-300 focus:ring-[var(--color-luxury-gold)]"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Coupon is Active
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-[var(--color-luxury-black)] text-white px-8 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all hover:bg-gray-900 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
        {isLoading && !isFormOpen ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-rose-gold)]" />
            <p>Loading coupons...</p>
          </div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Expires</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {coupons.map((coupon) => {
                   const isExpired = coupon.expiration_date && new Date(coupon.expiration_date) < new Date();
                   const isExhausted = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
                   
                   return (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[var(--color-luxury-black)] tracking-wider">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600">
                      {coupon.discount_amount > 0 ? `${coupon.discount_amount} LYD OFF` : `${coupon.discount_percentage}% OFF`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {isExpired ? (
                          <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">Expired</span>
                        ) : isExhausted ? (
                          <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">Exhausted</span>
                        ) : coupon.active ? (
                          <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                        ) : (
                          <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">Inactive</span>
                        )}
                        {coupon.is_free_shipping && (
                          <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">Free Shipping</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="font-medium text-[var(--color-luxury-black)]">{coupon.used_count}</span>
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' (Unlimited)'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {coupon.expiration_date ? new Date(coupon.expiration_date).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleStatus(coupon.id, coupon.active)}
                          title={coupon.active ? "Deactivate" : "Activate"}
                          className="p-2 text-gray-400 hover:text-[var(--color-luxury-black)] bg-white border border-gray-100 shadow-sm hover:shadow rounded-lg transition-all"
                        >
                          <RefreshCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenForm(coupon)}
                          className="p-2 text-blue-500 hover:text-blue-700 bg-white border border-gray-100 shadow-sm hover:shadow rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 bg-white border border-gray-100 shadow-sm hover:shadow rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
               <AlertCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-serif text-[var(--color-luxury-black)] mb-2">No coupons found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">Create discount codes to offer special promotions to your customers.</p>
            <button 
              onClick={() => handleOpenForm()}
              className="text-[var(--color-rose-gold)] font-medium hover:text-[var(--color-luxury-gold)] transition-colors underline underline-offset-4"
            >
              Create your first coupon
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
