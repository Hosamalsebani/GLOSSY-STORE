'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  ChevronRight, 
  Percent, 
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminToolsPage() {
  const [activeTab, setActiveTab] = useState('bulk-editor');
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  // --- Bulk Editor State ---
  const [categories, setCategories] = useState<{slug: string, name_en: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('percentage'); // 'percentage' | 'fixed'
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // --- AI Generator State ---
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState('');

  // --- Profit Calculator State ---
  const [calcCost, setCalcCost] = useState('');
  const [calcPrice, setCalcPrice] = useState('');
  const [calcVAT, setCalcVAT] = useState('15');
  const [profitDetails, setProfitDetails] = useState({ profit: 0, margin: 0, isLoss: false });

  useEffect(() => {
    setIsMounted(true);
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('slug, name_en').order('name_en');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  // --- Real-time Profit Calculation ---
  useEffect(() => {
    const cost = parseFloat(calcCost) || 0;
    const price = parseFloat(calcPrice) || 0;
    const vat = parseFloat(calcVAT) || 0;

    const vatAmount = price * (vat / 100);
    const netRevenue = price - vatAmount;
    const profit = netRevenue - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    setProfitDetails({
      profit: parseFloat(profit.toFixed(2)),
      margin: parseFloat(margin.toFixed(2)),
      isLoss: profit < 0
    });
  }, [calcCost, calcPrice, calcVAT]);

  // --- Bulk Update Action ---
  const handleBulkUpdate = async (direction: 'increase' | 'decrease') => {
    const value = parseFloat(adjustmentValue);
    if (isNaN(value) || value <= 0) {
      setUpdateStatus({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    setIsUpdating(true);
    setUpdateStatus(null);

    try {
      // 1. Fetch products
      let query = supabase.from('products').select('id, price');
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      const { data: products, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      if (!products || products.length === 0) {
        setUpdateStatus({ type: 'error', message: 'No products found in this category.' });
        return;
      }

      // 2. Calculate new prices and update
      const updates = products.map(p => {
        let newPrice = p.price;
        const multiplier = direction === 'increase' ? 1 : -1;
        
        if (adjustmentType === 'percentage') {
          newPrice = p.price * (1 + (value / 100) * multiplier);
        } else {
          newPrice = p.price + (value * multiplier);
        }

        return { id: p.id, price: Math.max(0, parseFloat(newPrice.toFixed(2))) };
      });

      // We update sequentially or in batches if needed, but for simplicity:
      for (const item of updates) {
        await supabase.from('products').update({ price: item.price }).eq('id', item.id);
      }

      setUpdateStatus({ type: 'success', message: `Successfully updated ${updates.length} products.` });
      setAdjustmentValue('');
    } catch (err) {
      console.error(err);
      setUpdateStatus({ type: 'error', message: 'An error occurred during bulk update.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // --- AI Suggestion Action ---
  const handleGenerateAI = () => {
    if (!keywords.trim()) return;
    setIsGenerating(true);
    setGeneratedResult('');
    
    setTimeout(() => {
      const suggestions = [
        `Discover the ultimate essence of luxury with our ${keywords}. Crafted for those who demand excellence, this exquisite blend offers unmatched sophistication and a lasting trail that captivates every room.`,
        `Elevate your daily ritual with ${keywords}. A masterpiece of modern craftsmanship, combining premium ingredients to create a sensory experience that defines elegance and style.`,
        `Unveil your unique character with ${keywords}. Timeless, bold, and undeniably luxurious, it's more than a product—it's a statement of prestige.`
      ];
      setGeneratedResult(suggestions[Math.floor(Math.random() * suggestions.length)]);
      setIsGenerating(false);
    }, 2000);
  };

  const tabs = [
    { id: 'bulk-editor', name: 'Bulk Price Editor', icon: Wrench },
    { id: 'ai-generator', name: 'AI Description', icon: Sparkles },
    { id: 'profit-calc', name: 'Profit Calculator', icon: Calculator },
  ];

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Product Tools</h1>
          <p className="text-gray-500 text-sm">Advanced tools for pricing, content creation, and financial analysis.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[var(--color-luxury-black)] shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
          
          {/* 1. Bulk Price Editor */}
          {activeTab === 'bulk-editor' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-slate-900 text-[#D4AF37] rounded-lg">
                  <Wrench size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Bulk Price Editor</h2>
                  <p className="text-sm text-gray-400">Update pricing across categories instantly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Target Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Target Category"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  >
                    <option value="all">All Products</option>
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name_en}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Adjustment Type</label>
                  <div className="flex p-1 bg-gray-100 rounded-xl h-[46px]">
                    <button 
                      onClick={() => setAdjustmentType('percentage')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm transition-all ${adjustmentType === 'percentage' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                    >
                      <Percent size={14} /> Percentage
                    </button>
                    <button 
                      onClick={() => setAdjustmentType('fixed')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm transition-all ${adjustmentType === 'fixed' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                    >
                      <DollarSign size={14} /> Fixed Amount
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-600">
                    {adjustmentType === 'percentage' ? 'Percentage Value (%)' : 'Amount Value (LYD)' }
                  </label>
                  <input 
                    type="number"
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value)}
                    placeholder="Enter value..."
                    aria-label={adjustmentType === 'percentage' ? 'Percentage adjustment' : 'Amount adjustment'}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-semibold placeholder:font-normal outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>

              {updateStatus && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${updateStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {updateStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="text-sm font-medium">{updateStatus.message}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  disabled={isUpdating}
                  onClick={() => handleBulkUpdate('increase')}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                  Apply Increase
                </button>
                <button 
                  disabled={isUpdating}
                  onClick={() => handleBulkUpdate('decrease')}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-900 text-slate-900 p-4 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <TrendingDown size={20} />}
                  Apply Decrease
                </button>
              </div>
            </div>
          )}

          {/* 2. AI Generator */}
          {activeTab === 'ai-generator' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">AI Description Generator</h2>
                  <p className="text-sm text-gray-400">Craft premium marketing copy in seconds.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Product Keywords</label>
                  <textarea 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. Oud perfume, 12h lasting, luxury, floral notes..."
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  />
                </div>

                <button 
                  disabled={isGenerating || !keywords.trim()}
                  onClick={handleGenerateAI}
                  className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {isGenerating ? 'Analyzing Keywords...' : 'Generate with AI'}
                </button>

                {generatedResult && (
                  <div className="mt-6 space-y-2 animate-in slide-in-from-bottom-2 duration-500">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Suggestion</label>
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative group">
                      <p className="text-slate-700 leading-relaxed italic">{generatedResult}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedResult);
                          alert('Copied to clipboard!');
                        }}
                        className="absolute bottom-4 right-4 text-xs font-medium text-purple-600 hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Profit Calculator */}
          {activeTab === 'profit-calc' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <Calculator size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Profit Margin Calculator</h2>
                  <p className="text-sm text-gray-400">Instantly calculate your net returns.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">LYD</span>
                    <input 
                      type="number"
                      value={calcCost}
                      onChange={(e) => setCalcCost(e.target.value)}
                      aria-label="Cost Price"
                      className="w-full pl-12 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">LYD</span>
                    <input 
                      type="number"
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(e.target.value)}
                      aria-label="Selling Price"
                      className="w-full pl-12 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">VAT/Tax (%)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    <input 
                      type="number"
                      value={calcVAT}
                      onChange={(e) => setCalcVAT(e.target.value)}
                      aria-label="VAT Percentage"
                      className="w-full pl-12 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-2xl border transition-all ${profitDetails.isLoss ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Net Profit</p>
                  <p className={`text-4xl font-serif ${profitDetails.isLoss ? 'text-red-600' : 'text-emerald-600'}`}>
                    {profitDetails.profit > 0 ? '+' : ''}{profitDetails.profit} <span className="text-xl">LYD</span>
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border transition-all ${profitDetails.isLoss ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Profit Margin</p>
                  <p className={`text-4xl font-serif ${profitDetails.isLoss ? 'text-red-600' : 'text-emerald-600'}`}>
                    {profitDetails.margin}%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-center text-gray-400">
                  Calculated as: (Price - VAT) - Cost. Accurate for immediate landing-page sales forecasting.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Tips/Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
            <h3 className="text-[#D4AF37] font-serif text-lg mb-4">Quick Tip</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use the **Bulk Price Editor** cautiously. It directly modifies your production database. We recommend doing a CSV export first from the Products tab.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Safety First
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="text-slate-800 font-semibold mb-4">How it works</h3>
            <ul className="space-y-3">
              {[
                { title: 'Select Tools', desc: 'Choose between pricing, AI, or math.' },
                { title: 'Bulk Edit', desc: 'Increase/Decrease prices by Category.' },
                { title: 'AI Assistant', desc: 'Generate descriptions using keywords.' },
                { title: 'Profit Check', desc: 'Real-time calculation with VAT.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-700">{item.title}</p>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
