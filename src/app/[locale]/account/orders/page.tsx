'use client';

import { useEffect, useState } from 'react';
import { Package, ArrowRight, Eye, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
};

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  items_count: number;
  cart_items: any[];
  shipping_address: {
    city?: string;
    [key: string]: any;
  } | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-amber-600 bg-amber-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 uppercase tracking-widest text-sm">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-gray-200 mb-6" />
        <h2 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-4">No Orders Yet</h2>
        <p className="text-gray-500 mb-8 max-w-sm">When you place an order, it will appear here so you can track its status.</p>
        <Link href="/shop" className="px-8 py-3 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors uppercase tracking-widest text-sm inline-flex items-center gap-2">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Order History</h2>
        <p className="text-gray-500 text-sm">Review your past purchases and track current orders.</p>
      </div>
      
      <div className="space-y-6">
        {orders.map((order) => {
          const cartItems = order.cart_items || [];
          const shortId = order.id.slice(0, 8).toUpperCase();

          return (
            <div key={order.id} className="border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-[var(--color-rose-gold)]/30 transition-all duration-500 rounded-[1.5rem] overflow-hidden">
              <div className="bg-gray-50/50 border-b border-gray-100 px-6 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Date Placed</p>
                    <p className="text-sm font-medium text-[var(--color-luxury-black)]">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Total</p>
                    <p className="text-sm font-black text-[var(--color-luxury-black)]">
                    ${Number(order.total_amount || 0).toFixed(2)}
                  </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Status</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Order Number</p>
                  <p className="text-sm font-black text-[var(--color-luxury-black)]">GL-{shortId}</p>
                </div>
              </div>
              
              <div className="px-6 md:px-8 py-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1 w-full">
                    {cartItems.length > 0 ? (
                      <div className="space-y-3">
                        {cartItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-medium">
                              {item.name} <span className="text-gray-400 font-normal ml-2">× {item.quantity}</span>
                            </span>
                            <span className="font-bold text-[var(--color-luxury-black)]">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Order items not available</p>
                    )}
                  </div>
                  
                  {order.shipping_address?.city && (
                    <div className="text-left md:text-right text-sm text-gray-500 mt-4 md:mt-0 max-w-xs">
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-1">Shipping Destination</p>
                      <p className="font-medium text-gray-700">{order.shipping_address.city}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
