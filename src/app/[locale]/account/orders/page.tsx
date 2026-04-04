'use client';

import { useEffect, useState, use } from 'react';
import { 
  Package, 
  Loader2, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  discount_amount: number;
  cart_items: CartItem[];
  customer_name: string;
  customer_phone: string;
  address: string;
  region?: string;
  payment_method?: string;
};

const statusConfig: Record<string, { icon: React.ComponentType<any>; color: string; bgColor: string; borderColor: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-50/50', borderColor: 'border-amber-100/50' },
  processing: { icon: Loader2, color: 'text-blue-500', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-100/50' },
  shipped: { icon: Truck, color: 'text-indigo-500', bgColor: 'bg-indigo-50/50', borderColor: 'border-indigo-100/50' },
  delivered: { icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50/50', borderColor: 'border-emerald-100/50' },
  cancelled: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50/50', borderColor: 'border-red-100/50' },
};

export default function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations('Orders');
  const tCart = useTranslations('Cart');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
  }, [supabase]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-LY' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateStr));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-LY' : 'en-US', {
      style: 'currency',
      currency: 'LYD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center font-cairo">
        <Loader2 size={30} className="animate-spin text-[#D4AF37] mb-4" />
        <p className="text-gray-400 font-medium text-xs tracking-widest">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center font-cairo px-4">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag size={24} className="text-gray-200" />
        </div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">{t('emptyTitle')}</h2>
        <p className="text-gray-400 mb-8 max-w-xs text-xs font-medium">{t('emptyMessage')}</p>
        <Link href="/shop" className="px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] transition-all flex items-center gap-2">
          {t('returnToShop')}
          {locale === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-cairo px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{t('title')}</h2>
        <p className="text-gray-400 font-medium text-xs">{t('subtitle')}</p>
      </motion.div>
      
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order, index) => {
          const isExpanded = expandedId === order.id;
          const config = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const shortId = order.id.slice(0, 8).toUpperCase();
          const cartItems = order.cart_items || [];

          return (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border transition-all duration-300 ${isExpanded ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/10 shadow-lg' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
            >
              {/* Card Header (Visible in list) */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t('orderNumber')}</span>
                    <p className="text-[11px] font-black text-[#1A1A1A]">GL-{shortId}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t('datePlaced')}</span>
                    <p className="text-[11px] font-bold text-[#1A1A1A]">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t('total')}</span>
                    <p className="text-[12px] font-black text-[#D4AF37]">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.color} font-black text-[8px] uppercase tracking-widest h-fit`}>
                    <StatusIcon size={10} className={order.status === 'processing' ? 'animate-spin' : ''} />
                    {t(`statuses.${order.status}`)}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
                   <div className="flex -space-x-3 rtl:space-x-reverse overflow-hidden">
                      {cartItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border border-white shadow-sm overflow-hidden bg-gray-50 relative">
                          <Image src={item.image_url || '/images/placeholder.png'} alt="" fill className="object-cover" />
                        </div>
                      ))}
                      {cartItems.length > 3 && (
                        <div className="w-8 h-8 rounded-full border border-white bg-[#1A1A1A] text-white flex items-center justify-center text-[7px] font-black ring-1 ring-white">
                          +{cartItems.length - 3}
                        </div>
                      )}
                   </div>
                   <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-[#D4AF37] text-white' : 'bg-gray-50 text-gray-400 group-hover:text-[#1A1A1A]'}`}>
                     {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                   </div>
                </div>
              </div>

              {/* Expansion Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-8 md:px-8 md:pb-10 border-t border-gray-50 bg-gray-50/10">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
                        {/* Tracking Summary (Left) */}
                        <div className="lg:col-span-12 space-y-8">
                          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                             <h3 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-8 flex items-center gap-2">
                               <Truck size={14} className="text-[#D4AF37]" />
                               {t('trackingStatus')}
                             </h3>
                             
                             {/* Stepper horizontal for more compact look */}
                             <div className="flex flex-col sm:flex-row justify-between relative mt-4 gap-4 px-2">
                                <div className="absolute top-4 left-4 right-4 h-[1px] bg-gray-100 hidden sm:block" />
                                {['pending', 'processing', 'shipped', 'delivered'].map((step) => {
                                  const steps = ['pending', 'processing', 'shipped', 'delivered'];
                                  const currentIdx = steps.indexOf(order.status);
                                  const isDone = steps.indexOf(step) <= currentIdx;
                                  const isCurrent = steps.indexOf(step) === currentIdx;
                                  const StepIcon = statusConfig[step]?.icon || CheckCircle2;

                                  return (
                                    <div key={step} className="relative flex flex-row sm:flex-col items-center gap-3 sm:gap-4 z-10 flex-1">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 ${isDone ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-md' : 'bg-white border-gray-100 text-gray-200'} ${isCurrent ? 'scale-110 ring-4 ring-[#D4AF37]/10' : ''}`}>
                                        <StepIcon size={12} className={isCurrent && step === 'processing' ? 'animate-spin' : ''} />
                                      </div>
                                      <span className={`text-[8px] font-black uppercase tracking-wider text-center ${isDone ? 'text-[#1A1A1A]' : 'text-gray-300'}`}>{t(`statuses.${step}`)}</span>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="lg:col-span-7 space-y-4">
                          <h3 className="text-[9px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Package size={14} className="text-[#D4AF37]" />
                            {t('itemsOrdered')}
                          </h3>
                          <div className="space-y-3">
                            {cartItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-50 shadow-sm">
                                <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 relative">
                                  <Image src={item.image_url || '/images/placeholder.png'} alt="" fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-[#1A1A1A] truncate">{item.name}</p>
                                  <p className="text-[11px] font-black text-[#D4AF37]">{formatCurrency(item.price)}</p>
                                </div>
                                <div className="text-[9px] font-black text-gray-300 uppercase px-2 py-1 bg-gray-50 rounded-md">x{item.quantity}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Summary & Shipping */}
                        <div className="lg:col-span-5 space-y-6">
                           <div className="bg-[#1A1A1A] rounded-xl p-6 text-white">
                             <div className="space-y-3 mb-6">
                               <div className="flex justify-between text-[9px] font-bold opacity-40">
                                 <span className="uppercase tracking-widest">{t('subtotal')}</span>
                                 <span>{formatCurrency(order.total_amount - (order.shipping_cost || 0) + (order.discount_amount || 0))}</span>
                               </div>
                               <div className="flex justify-between text-[9px] font-bold text-emerald-400">
                                 <span className="opacity-60 uppercase tracking-widest">{tCart('discount')}</span>
                                 <span>-{formatCurrency(order.discount_amount || 0)}</span>
                               </div>
                               <div className="flex justify-between text-[9px] font-bold opacity-40">
                                 <span className="uppercase tracking-widest">{t('shipping')}</span>
                                 <span>{formatCurrency(order.shipping_cost || 0)}</span>
                               </div>
                             </div>
                             <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                               <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">{tCart('total')}</span>
                               <span className="text-xl font-black text-[#D4AF37]">{formatCurrency(order.total_amount)}</span>
                             </div>
                           </div>

                           <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-sm">
                              <div className="flex items-center gap-2 text-[9px] font-black text-[#1A1A1A] uppercase tracking-widest mb-2">
                                <MapPin size={12} className="text-[#D4AF37]" />
                                {t('deliveryDetails')}
                              </div>
                              <div className="space-y-3">
                                <div className="p-3 bg-gray-50/50 rounded-lg border border-transparent">
                                  <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Phone</p>
                                  <p className="text-[10px] font-bold text-[#1A1A1A]">{order.customer_phone}</p>
                                </div>
                                <div className="p-3 bg-gray-50/50 rounded-lg border border-transparent">
                                  <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Location</p>
                                  <p className="text-[10px] font-bold text-[#1A1A1A]">{order.region || order.address}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 pt-2 text-[8px] font-black text-gray-300 uppercase tracking-widest justify-center">
                                <ShieldCheck size={10} className="text-[#D4AF37]" />
                                {order.payment_method || 'Cash on Delivery'}
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
