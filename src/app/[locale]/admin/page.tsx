'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Loader2, BarChart3, Package, FileText, AlertTriangle, Calendar, Download, PieChart, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/invoice';
import { generateFinancialReportPDF, generateFinancialReportExcel, ReportData } from '@/utils/reports';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');
  
  const [stats, setStats] = useState<any[]>([
    { name: t('revenue'), value: '0.00 د.ل', change: 'Live', icon: DollarSign, color: 'gold' },
    { name: 'Gross Profit', value: '0.00 د.ل', change: 'Live', icon: TrendingUp, color: 'emerald' },
    { name: 'COGS', value: '0.00 د.ل', change: 'Live', icon: PieChart, color: 'rose' },
    { name: 'Net Margin', value: '0%', change: 'Live', icon: BarChart3, color: 'blue' },
  ]);

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [fullReportData, setFullReportData] = useState<ReportData | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Calculate date filters
      let dateFilter = new Date();
      if (dateRange === 'today') dateFilter.setHours(0, 0, 0, 0);
      else if (dateRange === '7d') dateFilter.setDate(dateFilter.getDate() - 7);
      else if (dateRange === '30d') dateFilter.setDate(dateFilter.getDate() - 30);
      else if (dateRange === 'all') dateFilter = new Date(0);

      // 1. Fetch Orders with Items for P&L
      const { data: ordersWithItems, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          status,
          customer_name,
          customer_phone,
          customer_email,
          address,
          region,
          cart_items,
          order_items (
            quantity,
            price,
            cost_price
          )
        `)
        .gte('created_at', dateFilter.toISOString())
        .neq('status', 'cancelled');

      if (ordersError) throw ordersError;

      // 2. Calculate P&L Metrics
      let totalRevenue = 0;
      let totalCOGS = 0;
      let itemsCount = 0;
      const productMap = new Map();

      ordersWithItems?.forEach(order => {
        totalRevenue += Number(order.total_amount) || 0;
        
        // Use order_items if available, fallback to cart_items JSON
        const items = order.order_items && order.order_items.length > 0 
          ? order.order_items 
          : (order.cart_items || []);

        items.forEach((item: any) => {
          const qty = item.quantity || 1;
          const cost = item.cost_price || 0;
          const price = item.price_at_time || item.price || 0;
          const name = item.name || 'Product';
          
          totalCOGS += (cost * qty);
          itemsCount += qty;

          // Aggregates for report
          const existing = productMap.get(name) || { name, quantity: 0, revenue: 0, profit: 0 };
          productMap.set(name, {
            ...existing,
            quantity: existing.quantity + qty,
            revenue: existing.revenue + (price * qty),
            profit: existing.profit + ((price - cost) * qty)
          });
        });
      });

      const grossProfit = totalRevenue - totalCOGS;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // 3. Update Stats
      setStats([
        { name: t('revenue'), value: `${totalRevenue.toLocaleString()} د.ل`, change: 'Live', icon: DollarSign, color: 'gold' },
        { name: 'Gross Profit', value: `${grossProfit.toLocaleString()} د.ل`, change: `${profitMargin.toFixed(1)}%`, icon: TrendingUp, color: 'emerald' },
        { name: 'COGS', value: `${totalCOGS.toLocaleString()} د.ل`, change: `${((totalCOGS / (totalRevenue || 1)) * 100).toFixed(0)}%`, icon: PieChart, color: 'rose' },
        { name: 'Net Margin', value: `${profitMargin.toFixed(1)}%`, change: 'Live', icon: BarChart3, color: 'blue' },
      ]);

      // Prepare data for export
      setFullReportData({
        startDate: dateFilter.toLocaleDateString(),
        endDate: new Date().toLocaleDateString(),
        revenue: totalRevenue,
        cogs: totalCOGS,
        grossProfit,
        profitMargin,
        ordersCount: ordersWithItems?.length || 0,
        itemsCount,
        averageOrderValue: totalRevenue / (ordersWithItems?.length || 1),
        topSellingProducts: Array.from(productMap.values()).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5),
        dailyMetrics: [],
        categoryPerformance: []
      });

      // 4. Other Counts (Users/Products)
      const [{ count: usersCount }, { count: productsCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
        supabase.from('products').select('*', { count: 'exact', head: true })
      ]);

      // 5. Fetch Recent Orders (just the latest 5 regardless of filter for the table)
      const { data: recentData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentData) {
        setRecentOrders(recentData.map(order => ({
          ...order,
          customer: order.customer_name || 'Guest User',
          date: new Date(order.created_at).toLocaleDateString(),
          total: `${Number(order.total_amount || 0).toFixed(2)} د.ل`
        })));
      }

      // 6. Trending Products
      const { data: trendingData } = await supabase.from('products').select('*').limit(4);
      if (trendingData) setTrendingProducts(trendingData);

      // 7. Low Stock
      const { data: lowStockData } = await supabase.from('products').select('*').lte('stock', 5).limit(4);
      if (lowStockData) setLowStockProducts(lowStockData);

    } catch (err: any) {
      console.error('Error fetching dashboard data details:', err);
      // Better error reporting for the user
      const errorMessage = err.message || JSON.stringify(err);
      console.error('Unified Error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    if (!fullReportData) return;
    setIsExporting(true);
    if (type === 'pdf') generateFinancialReportPDF(fullReportData);
    else generateFinancialReportExcel(fullReportData);
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Premium Header with Intelligence Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/20 shadow-sm">
        <div>
          <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] mb-2 tracking-tight flex items-center gap-3">
            {t('dashboard')}
            <span className="text-xs font-sans font-bold bg-[var(--color-luxury-gold)]/10 text-[var(--color-luxury-gold)] px-2.5 py-1 rounded-full uppercase tracking-widest">Financial Center</span>
          </h1>
          <p className="text-gray-500 font-light flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time P&L intelligence and reporting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            {(['today', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  dateRange === range 
                  ? 'bg-[var(--color-luxury-black)] text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:border-[var(--color-luxury-gold)] transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={16} className="text-red-500" />
              {isExporting ? 'Generating...' : 'P&L Statement'}
            </button>
            <button 
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-luxury-black)] text-white rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, i: number) => (
          <div key={stat.name} className="bg-white/80 backdrop-blur-md p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden group hover:border-[var(--color-rose-gold)]/30 transition-all duration-300 transform hover:-translate-y-1">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
               <stat.icon className="w-24 h-24" />
             </div>
             
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                'bg-[var(--color-rose-gold)]/10 text-[var(--color-luxury-gold)]'
              }`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
              }`}>
                {stat.change === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
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
        <div className="lg:col-span-2 space-y-8">
           {lowStockProducts.length > 0 && (
             <div className="bg-amber-50/50 border border-amber-200/50 shadow-sm rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
               <div className="p-4 border-b border-amber-200/50 flex justify-between items-center bg-amber-100/30">
                 <div className="flex items-center gap-2 text-amber-800">
                   <AlertTriangle size={20} className="animate-pulse" />
                   <h2 className="text-lg font-serif font-medium">Low Stock Alert</h2>
                 </div>
               </div>
               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {lowStockProducts.map((product: any) => {
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

          <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-50">
              <h2 className="text-xl font-serif text-[var(--color-luxury-black)]">{t('recentOrders')}</h2>
              <Link href="/admin/orders" className="text-sm text-[var(--color-rose-gold)] font-medium hover:text-[var(--color-luxury-gold)] transition-colors inline-flex items-center gap-1">
                {t('viewAll')}
              </Link>
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
                  {recentOrders.map((order: any) => (
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
                {trendingProducts.map((product: any, index: number) => {
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
