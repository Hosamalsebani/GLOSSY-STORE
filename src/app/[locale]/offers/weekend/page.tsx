'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, ArrowRight, ShoppingBag, Clock, Star, Gift } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';

export default function WeekendOffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [sparkleProps, setSparkleProps] = useState<any[]>([]);
  
  const supabase = createClient();
  const t = useTranslations('Shop');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    // Generate stable random properties for sparkles on the client only
    const props = [...Array(6)].map(() => ({
      xRandom: Math.random() * 40 - 20,
      durationRandom: 5 + Math.random() * 5,
      delayRandom: Math.random() * 5,
      leftRandom: Math.random() * 100,
      sizeRandom: 16 + Math.random() * 20
    }));
    setSparkleProps(props);
  }, []);

  useEffect(() => {
    const fetchWeekendOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_weekend_offer', true);

        if (!error && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching weekend offers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekendOffers();
  }, [supabase]);

  if (!hasMounted) {
    // Return a matching placeholder during SSR to prevent hydration mismatch
    return <div className="min-h-screen bg-[#F8FBFE]" />;
  }

  return (
    <div className="min-h-screen bg-[#F8FBFE] pb-24 selection:bg-sky-100 selection:text-sky-900">
      {/* Premium Header with Vertical Image Support */}
      <div className="relative h-[85vh] md:h-[90vh] overflow-hidden flex items-center justify-center">
        {/* Background Image - Optimized for Vertical Layout */}
        <div className="absolute inset-0 z-0 bg-sky-50">
          <motion.img 
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="/images/banners/weekend_banner.png" 
            alt="Weekend Offers Banner"
            className="w-full h-full object-cover object-center md:object-[center_20%]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=2670&auto=format&fit=crop";
            }}
          />
          {/* Elegant Sky Blue & Gold Gradient Overlay - Enhanced for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/60 via-transparent to-[#F8FBFE]" />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-transparent to-amber-500/10" />
        </div>

        {/* Floating Animated Elements (Cosmetic Flourish) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {sparkleProps.map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                y: [0, -100], 
                opacity: [0, 0.4, 0],
                x: prop.xRandom 
              }}
              transition={{ 
                duration: prop.durationRandom, 
                repeat: Infinity, 
                delay: prop.delayRandom 
              }}
              className="absolute text-white/40"
              style={{
                left: `${prop.leftRandom}%`,
                bottom: '10%'
              }}
            >
              <Sparkles size={prop.sizeRandom} />
            </motion.div>
          ))}
        </div>

        <div className="md:container md:mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-white/30 backdrop-blur-2xl px-6 py-2 rounded-full shadow-2xl mb-10 border border-white/40"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white drop-shadow-md">
              {isRtl ? 'عروض الويكند الحصرية' : 'Exclusive Weekend Offers'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            className="text-6xl md:text-[10rem] font-black text-white mb-10 tracking-tighter leading-none"
          >
            <span className="block drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {isRtl ? 'عروض' : 'Weekend'}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-100 via-white to-amber-100 drop-shadow-xl mt-[-0.2em]">
              {isRtl ? 'الويكند' : 'Offers'}
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-xl shadow-sky-900/20 text-sky-900 font-black text-lg">
              <Clock size={20} className="text-sky-500 animate-pulse" />
              <span>{isRtl ? 'باقي يومان فقط' : '2 Days Left'}</span>
            </div>
            <div className="flex items-center gap-3 bg-amber-500 px-6 py-3 rounded-2xl shadow-xl shadow-amber-900/20 text-white font-black text-lg border-b-4 border-amber-700">
              <Star size={20} className="fill-white" />
              <span>{isRtl ? 'خصومات نارية ٥٠٪' : 'Hot 50% Discounts'}</span>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`absolute top-10 ${isRtl ? 'right-10' : 'left-10'} z-20 w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-sky-900 transition-all shadow-2xl group active:scale-90`}
          aria-label={isRtl ? 'رجوع' : 'Back'}
        >
          {isRtl ? <ArrowRight size={32} className="group-hover:translate-x-1" /> : <ArrowLeft size={32} className="group-hover:-translate-x-1" />}
        </button>

        {/* Decorative Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest">{isRtl ? 'اسحب للاسفل' : 'Scroll Down'}</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </div>

      {/* Products Grid Section */}
      <div className="md:container md:mx-auto px-4 md:px-8 -mt-24 md:-mt-32 relative z-20">
        <div className="bg-white/70 backdrop-blur-3xl rounded-[60px] p-8 md:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-white ring-1 ring-sky-100/50">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h2 className="text-4xl md:text-6xl font-black text-sky-950 mb-4 tracking-tight">
                {isRtl ? 'اكتشفي التشكيلة' : 'Discover Collection'}
              </h2>
              <div className="h-2 w-32 bg-sky-500 rounded-full" />
            </div>
            <div className="flex bg-sky-50 p-1.5 rounded-2xl border border-sky-100">
               <button className="px-6 py-2.5 bg-white shadow-sm rounded-xl text-sky-900 font-bold text-sm">
                 {isRtl ? 'الكل' : 'All'}
               </button>
               <button className="px-6 py-2.5 text-sky-600 font-bold text-sm hover:text-sky-900">
                 {isRtl ? 'الأكثر مبيعاً' : 'Best Sellers'}
               </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-sky-50/50 rounded-[40px] mb-6"></div>
                  <div className="h-5 bg-sky-50 rounded-full w-3/4 mb-4"></div>
                  <div className="h-8 bg-sky-50 rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 md:gap-x-12 md:gap-y-24">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-sky-50 flex items-center justify-center text-sky-200 mb-8 border-4 border-white shadow-xl"
              >
                <ShoppingBag size={60} />
              </motion.div>
              <h3 className="text-3xl font-black text-sky-950 mb-4">{isRtl ? 'لا توجد عروض اليوم' : 'No Active Offers Today'}</h3>
              <p className="text-sky-600/60 max-w-sm mx-auto text-lg mb-12">
                {isRtl ? 'يتم تحديث العروض أسبوعياً. عودي إلينا يوم الجمعة القادم لحقائب غامضة وخصومات حصرية!' : 'Offers are updated weekly. Check back next Friday for mystery bags and exclusive deals!'}
              </p>
              <Link 
                href="/shop"
                className="group relative px-12 py-5 bg-sky-950 text-white rounded-3xl font-black text-xl overflow-hidden shadow-2xl transition-all active:scale-95"
              >
                <span className="relative z-10">{isRtl ? 'استكشفي المتجر بالكامل' : 'Explore Full Store'}</span>
                <div className="absolute inset-0 bg-sky-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Promotional Banner Footer */}
      <div className="md:container md:mx-auto px-4 mt-24">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden bg-gradient-to-br from-sky-950 via-sky-900 to-black rounded-[60px] p-12 md:p-24 text-center text-white border border-white/10 shadow-3xl"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-400/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
          
          <Gift size={80} className="mx-auto text-sky-400 mb-8 opacity-50" />
          <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
            {isRtl ? 'هدايا مجانية لأول ١٠٠ طلب' : 'Free Gifts for First 100 Orders'}
          </h2>
          <p className="text-sky-200/60 text-xl md:text-2xl font-medium mb-12 max-w-2xl mx-auto">
            {isRtl ? 'استمتعي بهدية من اختيارنا مع كل طلب يتجاوز ٢٠٠ دينار ليبي طوال عطلة نهاية الأسبوع' : 'Enjoy a curated gift with every order over 200 LYD throughout the weekend.'}
          </p>
          <div className="flex flex-col items-center gap-4">
             <div className="px-8 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-amber-200 font-black text-2xl tracking-widest">
               WEEKEND50
             </div>
             <p className="text-sky-400 font-bold uppercase tracking-widest text-sm underline decoration-sky-800 underline-offset-8 decoration-2">
               {isRtl ? 'انقر لنسخ الكود' : 'Click to copy code'}
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
