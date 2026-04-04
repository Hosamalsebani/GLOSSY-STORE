'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, Loader2, 
  ArrowUpRight, ArrowDownRight, MapPin, Package, 
  PieChart as PieIcon, Calendar, Filter, Share2,
  Download, FileText, Mail, X
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/utils/format';

// Custom Tooltip for premium look
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 border border-gray-100 shadow-xl rounded-xl">
        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-sm font-bold text-[var(--color-luxury-black)]">
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Profit') ? formatCurrency(entry.value) : entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalysisPage() {
  const t = useTranslations('Admin');
  const at = useTranslations('Admin.analysis');
  
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Data States
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    aov: 0,
    profit: 0,
    profitMargin: 0,
    growth: 12.5 // Simulated for now
  });

  const supabase = createClient();

  useEffect(() => {
    fetchAnalysisData();
  }, [dateRange]);

  const fetchAnalysisData = async () => {
    setIsLoading(true);
    try {
      const dateFilter = new Date();
      if (dateRange === '7d') dateFilter.setDate(dateFilter.getDate() - 7);
      else if (dateRange === '30d') dateFilter.setDate(dateFilter.getDate() - 30);
      else if (dateRange === '90d') dateFilter.setDate(dateFilter.getDate() - 90);
      else if (dateRange === 'ytd') dateFilter.setMonth(0, 1);

      // Fetch Orders for the period
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id, created_at, total_amount, status, region, shipping_cost, discount_amount,
          order_items (quantity, price, cost_price, products (category))
        `)
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Aggregations
      const dailyMap = new Map();
      const regionMap = new Map();
      const categoryMap = new Map();
      const statusMap = new Map();

      let totalInitialRevenue = 0;
      let totalCost = 0;
      let totalShipping = 0;
      let totalDiscounts = 0;

      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const revenue = Number(order.total_amount) || 0;
        const shipping = Number(order.shipping_cost) || 0;
        const discount = Number(order.discount_amount) || 0;
        
        totalInitialRevenue += revenue;
        totalShipping += shipping;
        totalDiscounts += discount;

        // Daily Revenue & Profit
        let orderItemCost = 0;
        order.order_items?.forEach((item: any) => {
          const cost = (item.cost_price || 0) * (item.quantity || 1);
          orderItemCost += cost;
          totalCost += cost;

          // Category Stats
          const category = item.products?.category || 'Uncategorized';
          const existingCat = categoryMap.get(category) || { name: category, revenue: 0, profit: 0 };
          categoryMap.set(category, {
            ...existingCat,
            revenue: existingCat.revenue + (item.price * item.quantity),
            profit: existingCat.profit + ((item.price - (item.cost_price || 0)) * item.quantity)
          });
        });

        // Profit per order: Revenue (after discount) - Cost
        const profit = revenue - orderItemCost;
        
        const existingDay = dailyMap.get(date) || { date, revenue: 0, orders: 0, profit: 0 };
        dailyMap.set(date, {
          date,
          revenue: existingDay.revenue + revenue,
          orders: existingDay.orders + 1,
          profit: existingDay.profit + profit
        });

        // Regional Stats
        const rawRegion = order.region || 'Unknown';
        // Clean Arabic from region for PDF safety if needed, but for state we keep it
        regionMap.set(rawRegion, (regionMap.get(rawRegion) || 0) + revenue);

        // Status Stats
        const status = order.status || 'pending';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      setRevenueData(Array.from(dailyMap.values()));
      setRegionalData(Array.from(regionMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8));
      
      setCategoryData(Array.from(categoryMap.values())
        .sort((a, b) => b.revenue - a.revenue));

      setStatusData(Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })));

      setMetrics({
        totalRevenue: totalInitialRevenue,
        totalOrders: orders?.length || 0,
        aov: totalInitialRevenue / (orders?.length || 1),
        profit: totalInitialRevenue - totalCost,
        profitMargin: totalInitialRevenue > 0 ? ((totalInitialRevenue - totalCost) / totalInitialRevenue) * 100 : 0,
        growth: 14.2
      });

    } catch (err) {
      console.error('Error fetching analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#D4AF37', '#1A1A1A', '#E5E7EB', '#F97316', '#10B981', '#3B82F6', '#8B5CF6'];

  // ====== EXPORT FUNCTIONS ======

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    // Helper to format currency safely for PDF (English/LYD)
    const formatPDFCurrency = (val: number) => `${Number(val).toFixed(2)} LYD`;
    // Helper to strip non-ASCII (Arabic) for standard jspdf fonts
    const cleanStr = (str: string) => str.replace(/[^\x00-\x7F]/g, '').trim() || str.split('(')[0].trim();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(22);
    doc.text('GLOSSY', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Analytics Report — ${dateRange.toUpperCase()} — ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

    // Key Metrics
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(14);
    doc.text('Performance Summary', 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [['Metric', 'Value (LYD/Units)']],
      body: [
        ['Total Sales Revenue', formatPDFCurrency(metrics.totalRevenue)],
        ['Total Orders Count', String(metrics.totalOrders)],
        ['Average Order Value (AOV)', formatPDFCurrency(metrics.aov)],
        ['Estimated Gross Profit', formatPDFCurrency(metrics.profit)],
        ['Profit Margin', `${metrics.profitMargin.toFixed(1)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], textColor: [212, 175, 55], fontSize: 10 },
      bodyStyles: { fontSize: 10, textColor: [50, 50, 50] },
      margin: { left: 14, right: 14 },
    });

    // Daily Performance Table
    let currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.text('Daily Performance Data', 14, currentY);
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Date', 'Revenue', 'Orders', 'Profit']],
      body: revenueData.slice(-15).map(d => [d.date, formatPDFCurrency(d.revenue), String(d.orders), formatPDFCurrency(d.profit)]),
      theme: 'striped',
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    // Regional Sales
    if (regionalData.length > 0) {
      currentY = (doc as any).lastAutoTable.finalY + 12;
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      doc.text('Regional Distribution', 14, currentY);
      autoTable(doc, {
        startY: currentY + 4,
        head: [['Region', 'Revenue']],
        body: regionalData.map(r => [cleanStr(r.name), formatPDFCurrency(r.value)]),
        theme: 'striped',
        headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
    }

    // Category Performance
    if (categoryData.length > 0) {
      currentY = (doc as any).lastAutoTable.finalY + 12;
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      doc.text('Category Analysis', 14, currentY);
      autoTable(doc, {
        startY: currentY + 4,
        head: [['Category', 'Revenue', 'Est. Profit']],
        body: categoryData.map(c => [cleanStr(c.name), formatPDFCurrency(c.revenue), formatPDFCurrency(c.profit)]),
        theme: 'striped',
        headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY + 15 || 270;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This report is generated automatically by GLOSSY Analytics Engine.', pageWidth / 2, finalY, { align: 'center' });
    doc.text('Confidential - Internal Use Only', pageWidth / 2, finalY + 4, { align: 'center' });

    doc.save(`GLOSSY_Analysis_${dateRange}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportToCSV = () => {
    const rows: string[] = [];
    rows.push('=== GLOSSY ANALYTICS REPORT ===');
    rows.push(`Date Range,${dateRange.toUpperCase()}`);
    rows.push(`Generated,${new Date().toLocaleDateString()}`);
    rows.push('');
    rows.push('--- KEY METRICS ---');
    rows.push('Metric,Value');
    rows.push(`Total Revenue,${metrics.totalRevenue.toFixed(2)}`);
    rows.push(`Total Orders,${metrics.totalOrders}`);
    rows.push(`AOV,${metrics.aov.toFixed(2)}`);
    rows.push(`Profit,${metrics.profit.toFixed(2)}`);
    rows.push(`Profit Margin,${metrics.profitMargin.toFixed(1)}%`);
    rows.push('');

    if (revenueData.length > 0) {
      rows.push('--- DAILY REVENUE ---');
      rows.push('Date,Revenue,Orders,Profit');
      revenueData.forEach(d => rows.push(`${d.date},${d.revenue.toFixed(2)},${d.orders},${d.profit.toFixed(2)}`));
      rows.push('');
    }

    if (regionalData.length > 0) {
      rows.push('--- REGIONAL SALES ---');
      rows.push('Region,Revenue');
      regionalData.forEach(r => rows.push(`${r.name},${r.value.toFixed(2)}`));
      rows.push('');
    }

    if (categoryData.length > 0) {
      rows.push('--- CATEGORY PERFORMANCE ---');
      rows.push('Category,Revenue,Profit');
      categoryData.forEach(c => rows.push(`${c.name},${c.revenue.toFixed(2)},${c.profit.toFixed(2)}`));
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GLOSSY_Report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendEmailReport = async () => {
    if (!adminEmail) return;
    setEmailSending(true);
    setEmailStatus('idle');
    try {
      const res = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          metrics,
          dateRange,
          regionalData,
          categoryData,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setEmailStatus('success');
        setTimeout(() => { setShowEmailModal(false); setEmailStatus('idle'); }, 2000);
      } else if (result.fallback === 'mailto') {
        // Fallback: open mailto
        const subject = encodeURIComponent(`GLOSSY Analytics Report — ${dateRange.toUpperCase()}`);
        const body = encodeURIComponent(`Revenue: ${formatCurrency(metrics.totalRevenue)}\nOrders: ${metrics.totalOrders}\nAOV: ${formatCurrency(metrics.aov)}\nProfit Margin: ${metrics.profitMargin.toFixed(1)}%`);
        window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`);
        setShowEmailModal(false);
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    } finally {
      setEmailSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[var(--color-rose-gold)] animate-spin" />
        <p className="text-gray-400 font-serif tracking-widest animate-pulse">GENERATING INTELLIGENCE...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] mb-2 flex items-center gap-3">
             {at('title')}
             <span className="text-[10px] font-sans font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
               <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
               {at('realTime')}
             </span>
          </h1>
          <p className="text-gray-500 font-light italic">Advanced business intelligence for GLOSSY operations in Libya</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {(['7d', '30d', '90d', 'ytd'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                  dateRange === range 
                  ? 'bg-[var(--color-luxury-black)] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              title="Export as PDF"
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all border border-red-100"
            >
              <FileText size={14} /> PDF
            </button>
            <button
              onClick={exportToCSV}
              title="Export as CSV"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all border border-emerald-100"
            >
              <Download size={14} /> Excel
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              title="Email Report"
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all border border-blue-100"
            >
              <Mail size={14} /> Email
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: at('revenueTrend'), value: formatCurrency(metrics.totalRevenue), icon: DollarSign, trend: '+12.5%', color: 'gold' },
          { label: at('orderVolume'), value: metrics.totalOrders, icon: ShoppingBag, trend: '+8.2%', color: 'black' },
          { label: at('aov'), value: formatCurrency(metrics.aov), icon: TrendingUp, trend: '+2.1%', color: 'rose' },
          { label: at('profitMargin'), value: `${metrics.profitMargin.toFixed(1)}%`, icon: PieIcon, trend: '+1.4%', color: 'emerald' },
        ].map((item, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-[var(--color-luxury-black)] group-hover:bg-[var(--color-rose-gold)] group-hover:text-white transition-colors">
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={10} /> {item.trend}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-2xl font-serif text-[var(--color-luxury-black)]">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif text-[var(--color-luxury-black)]">{at('revenueTrend')} & {at('orderVolume')}</h3>
            <button title="Share report" className="p-2 text-gray-400 hover:text-black transition-colors"><Share2 size={18}/></button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  name="Profit"
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif text-[var(--color-luxury-black)]">{at('regionalSales')}</h3>
            <MapPin size={18} className="text-gray-300" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 500, fill: '#1A1A1A'}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#F9FAFB'}} />
                <Bar dataKey="value" name="Sales" radius={[0, 4, 4, 0]} barSize={20}>
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#1A1A1A'} fillOpacity={1 - (index * 0.1)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif text-[var(--color-luxury-black)]">{at('categoryPerformance')}</h3>
            <Package size={18} className="text-gray-300" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif text-[var(--color-luxury-black)]">{at('ordersByStatus')}</h3>
            <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-200"></div>)}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#F9FAFB'}} />
                <Bar dataKey="value" name="Orders" radius={[4, 4, 0, 0]} barSize={40}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'delivered' ? '#10B981' : entry.name === 'cancelled' ? '#EF4444' : '#6B7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Cities Table */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-6">{at('topCities')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {regionalData.slice(0, 4).map((city, i) => (
            <div key={i} className="flex flex-col p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-[var(--color-rose-gold)]/20 transition-all">
              <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Rank #{i+1}</span>
              <span className="text-lg font-serif text-[var(--color-luxury-black)]">{city.name}</span>
              <div className="mt-4 flex items-end justify-between">
                 <span className="text-xl font-bold">{formatCurrency(city.value)}</span>
                 <span className="text-xs text-emerald-600 font-bold">Top Performing</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowEmailModal(false)}
              title="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-serif text-[var(--color-luxury-black)]">Send Report via Email</h3>
              <p className="text-sm text-gray-400 mt-1">The analytics report will be sent as a formatted email</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Admin Email Address</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@glossy.ly"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              {emailStatus === 'success' && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm font-medium text-center">
                  ✅ Report sent successfully!
                </div>
              )}
              {emailStatus === 'error' && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium text-center">
                  ❌ Failed to send. Please try again.
                </div>
              )}

              <button
                onClick={sendEmailReport}
                disabled={emailSending || !adminEmail}
                className="w-full py-3 bg-[var(--color-luxury-black)] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {emailSending ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Mail size={16} /> Send Report</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
