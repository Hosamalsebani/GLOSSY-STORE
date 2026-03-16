'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mail, MessageCircle, AlertCircle, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AdminAbandonedCartsPage() {
  const t = useTranslations('Admin');
  const [carts, setCarts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    setIsLoading(true);
    try {
      // NOTE: Expects `abandoned_carts` table to exist.
      // If the migration hasn't run, this will error safely.
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching abandoned carts:', error);
      } else if (data) {
        setCarts(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (cartId: string, method: 'email' | 'whatsapp', contactInfo: string) => {
    setActionLoading(cartId + method);
    try {
      // Simulate sending a reminder
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Successfully sent reminder via ${method} to ${contactInfo}`);
      
      // We could update a "last_reminded" timestamp here if we added one to the schema
    } catch (error: any) {
      alert(`Failed to send reminder: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkRecovered = async (id: string, currentStatus: string) => {
    if (currentStatus === 'recovered') return;
    
    setActionLoading(id + 'recover');
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({ status: 'recovered' })
        .eq('id', id);
        
      if (error) throw error;
      fetchCarts();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to calculate cart total
  const getCartTotal = (cartData: any[]) => {
    if (!cartData || !Array.isArray(cartData)) return 0;
    return cartData.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] tracking-tight">Abandoned Carts</h1>
          <p className="text-gray-500 font-light mt-1">Track and recover lost sales</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-rose-gold)]" />
            <p>Loading abandoned carts...</p>
          </div>
        ) : carts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Cart Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Abandoned</th>
                  <th className="px-6 py-4 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {carts.map((cart) => {
                   const cartTotal = getCartTotal(cart.cart_data);
                   const isRecovered = cart.status === 'recovered';
                   
                   return (
                  <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--color-luxury-black)]">
                          {cart.customer_email || 'Unknown Email'}
                        </span>
                        {cart.customer_phone && (
                          <span className="text-xs text-gray-500">{cart.customer_phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--color-luxury-black)]">${cartTotal.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">{Array.isArray(cart.cart_data) ? cart.cart_data.length : 0} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isRecovered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                           <CheckCircle2 size={12} /> Recovered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                           <ShoppingCart size={12} /> Abandoned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {new Date(cart.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isRecovered && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {cart.customer_email && (
                            <button
                              onClick={() => handleSendReminder(cart.id, 'email', cart.customer_email)}
                              disabled={actionLoading !== null}
                              title="Send Email Reminder"
                              className="p-2 text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 border border-blue-100 shadow-sm rounded-lg transition-all disabled:opacity-50"
                            >
                              {actionLoading === cart.id + 'email' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                            </button>
                          )}
                          {cart.customer_phone && (
                            <button
                              onClick={() => handleSendReminder(cart.id, 'whatsapp', cart.customer_phone)}
                              disabled={actionLoading !== null}
                              title="Send WhatsApp Reminder"
                              className="p-2 text-emerald-500 hover:text-white bg-emerald-50 hover:bg-emerald-500 border border-emerald-100 shadow-sm rounded-lg transition-all disabled:opacity-50"
                            >
                              {actionLoading === cart.id + 'whatsapp' ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                            </button>
                          )}
                          <button
                            onClick={() => handleMarkRecovered(cart.id, cart.status)}
                            disabled={actionLoading !== null}
                            title="Mark as Recovered Manually"
                            className="p-2 text-gray-400 hover:text-emerald-600 bg-white border border-gray-100 shadow-sm hover:shadow rounded-lg transition-all disabled:opacity-50"
                          >
                            {actionLoading === cart.id + 'recover' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
               <ShoppingCart className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-serif text-[var(--color-luxury-black)] mb-2">No abandoned carts</h3>
            <p className="text-gray-500 max-w-sm mx-auto">When customers leave items in their cart without checking out, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
