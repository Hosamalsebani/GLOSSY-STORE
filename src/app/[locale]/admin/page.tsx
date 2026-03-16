'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Loader2, BarChart3, Package, FileText, AlertTriangle } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/invoice';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');
  
  const [stats, setStats] = useState([
    { name: t('revenue'), value: '$0.00', change: 'Live', icon: DollarSign },
    { name: t('orders'), value: '0', change: 'Live', icon: ShoppingBag },
    { name: t('customers'), value: '0', change: 'Live', icon: Users },
    { name: t('products'), value: '0', change: 'Live', icon: Package },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Stats
      const [
        { data: ordersData },
        { count: usersCount },
        { count: productsCount }
      ] = await Promise.all([
        supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
        supabase.from('users').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
        supabase.from('products').select('*', { count: 'exact', head: true })
      ]);

      const totalRevenue = ordersData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      const totalOrders = ordersData?.length || 0;

      setStats([
        { name: t('revenue'), value: `$${totalRevenue.toFixed(2)}`, change: 'Live', icon: DollarSign },
        { name: t('orders'), value: totalOrders.toString(), change: 'Live', icon: ShoppingBag },
        { name: t('customers'), value: (usersCount || 0).toString(), change: 'Live', icon: Users },
        { name: t('products'), value: (productsCount || 0).toString(), change: 'Live', icon: Package },
      ]);

      // 2. Fetch Recent Orders
      const { data: recentData } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          customer_name,
          customer_phone,
          customer_email,
          address,
          region,
          user_id,
          cart_items
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentData) {
        const ordersWithData = recentData.map(order => ({
          ...order,
          customer: order.customer_name || 'Guest User',
          date: new Date(order.created_at).toLocaleDateString(),
          total: `$${Number(order.total_amount || 0).toFixed(2)}`
        }));
        setRecentOrders(ordersWithData);
      }

      // 3. Fetch Trending Products (Top 4 products for now)
      const { data: trendingData } = await supabase
        .from('products')
        .select('*')
        .limit(4);
      
      if (trendingData) {
        setTrendingProducts(trendingData);
      }

      // 4. Fetch Low Stock Products (stock <= 5)
      const { data: lowStockData } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 5)
        .order('stock', { ascending: true })
        .limit(4);

      if (lowStockData) {
         setLowStockProducts(lowStockData);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] mb-2 tracking-tight">{t('dashboard')}</h1>
          <p className="text-gray-500 font-light">{t('welcomeBack')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={stat.name} className="bg-white/80 backdrop-blur-md p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden group hover:border-[var(--color-rose-gold)]/30 transition-all duration-300 transform hover:-translate-y-1">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
               <stat.icon className="w-24 h-24" />
             </div>
             
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-gradient-to-br from-[var(--color-rose-gold)]/10 to-transparent rounded-xl text-[var(--color-luxury-gold)]">
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {stat.change}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{stat.name}</p>
              <h3 className="text-3xl font-serif text-[var(--color-luxury-black)]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Orders) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Low Stock Alert */}
           {lowStockProducts.length > 0 && (
             <div className="bg-amber-50/50 border border-amber-200/50 shadow-sm rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
               <div className="p-4 border-b border-amber-200/50 flex justify-between items-center bg-amber-100/30">
                 <div className="flex items-center gap-2 text-amber-800">
                   <AlertTriangle size={20} className="animate-pulse" />
                   <h2 className="text-lg font-serif font-medium">Low Stock Alert</h2>
                 </div>
               </div>
               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {lowStockProducts.map(product => {
                    const productImg = product.image_url || (product.additional_images && product.additional_images.length > 0 ? product.additional_images[0] : null);
                    return (
                     <div key={product.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                        <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          {productImg ? (
                            <Image src={productImg} alt={product.name} fill className="object-cover" />
                          ) : (
                            <Package className="w-full h-full p-2 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                           <p className="text-xs font-bold text-amber-600">Only {product.stock} left</p>
                        </div>
                     </div>
                   )
                 })}
               </div>
             </div>
           )}

          {/* Recent Orders Table */}
          <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-50">
              <h2 className="text-xl font-serif text-[var(--color-luxury-black)]">{t('recentOrders')}</h2>
              <button className="text-sm text-[var(--color-rose-gold)] font-medium hover:text-[var(--color-luxury-gold)] transition-colors inline-flex items-center gap-1">
                {t('viewAll')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse rtl:text-right">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">{t('orderId')}</th>
                    <th className="px-6 py-4">{t('customer')}</th>
                    <th className="px-6 py-4">{t('date')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                    <th className="px-6 py-4">{t('total')}</th>
                    <th className="px-6 py-4 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-[var(--color-luxury-black)]">
                        <span className="font-mono text-xs">GL-{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{order.customer}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{order.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          order.status.toLowerCase() === 'processing' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          order.status.toLowerCase() === 'shipped' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          order.status.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          order.status.toLowerCase() === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}>
                          {t(`statuses.${order.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--color-luxury-black)]">{order.total}</td>
                      <td className="px-6 py-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateInvoicePDF(order);
                          }}
                          title="Generate PDF Invoice"
                          className="p-2 text-gray-400 hover:text-[var(--color-luxury-gold)] hover:bg-[var(--color-rose-gold)]/10 rounded-lg transition-all"
                        >
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                           <ShoppingBag className="w-8 h-8 opacity-20" />
                           <p>{t('noOrders')}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Trending) */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-transparent to-gray-50/50">
            <h2 className="text-xl font-serif text-[var(--color-luxury-black)]">{t('trendingProducts')}</h2>
            <div className="p-2 bg-white rounded-lg shadow-sm">
               <BarChart3 size={16} className="text-[var(--color-luxury-gold)]" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[var(--color-rose-gold)]" />
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="space-y-5">
                {trendingProducts.map((product, index) => {
                  const productImg = product.image_url || (product.additional_images && product.additional_images.length > 0 ? product.additional_images[0] : null);
                  
                  return (
                    <div key={product.id} className="flex items-center gap-4 group cursor-pointer">
                      <div className="text-sm font-bold text-gray-200 group-hover:text-[var(--color-rose-gold)] transition-colors w-4 text-center">
                        {index + 1}
                      </div>
                      <div className="relative w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {productImg ? (
                          <Image 
                            src={productImg} 
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-luxury-black)] truncate group-hover:text-[var(--color-luxury-gold)] transition-colors">{product.name}</p>
                        <p className="text-xs text-gray-500 font-medium">${product.price}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mb-1 flex items-center gap-1"><TrendingUp size={10} /> +12%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-400">
                <Package size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-medium">{t('noData')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
