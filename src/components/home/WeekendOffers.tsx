'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import ProductCard from '../ui/ProductCard';

export default function WeekendOffers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const t = useTranslations('Shop');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  useEffect(() => {
    const fetchWeekendOffers = async () => {
      try {
        // Query for products with is_weekend_offer = true
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_weekend_offer', true)
          .limit(10);

        if (!error && data && data.length > 0) {
          setProducts(data);
        } else {
          // Fallback: Just fetch any discounted products if no weekend offers tagged
          const { data: fallbackData } = await supabase
            .from('products')
            .select('*')
            .not('discount_percentage', 'is', null)
            .gt('discount_percentage', 0)
            .limit(6);
          
          if (fallbackData) setProducts(fallbackData);
        }
      } catch (err) {
        console.error('Error fetching weekend offers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekendOffers();
  }, [supabase]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = isRtl ? (direction === 'left' ? 300 : -300) : (direction === 'left' ? -300 : 300);
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-8 md:py-14 bg-[#F0F9FF] overflow-hidden">
      <div className="md:container md:mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-600 mb-1">
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                {isRtl ? 'عروض محدودة' : 'Limited Time'}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
              {isRtl ? 'عروض الويك اند' : 'Weekend Offers'}
            </h2>
          </div>
          
          <Link 
            href="/offers/weekend" 
            className="group flex items-center gap-1.5 text-sky-600 text-sm font-black hover:text-sky-700 transition-colors pb-1"
          >
            {t('viewAll')}
            <motion.div
              animate={{ x: isRtl ? -3 : 3 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            >
              <ChevronRight size={18} className={isRtl ? 'rotate-180' : ''} />
            </motion.div>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Nav Buttons (Desktop) */}
          <button 
            onClick={() => scroll('left')} 
            className={`absolute ${isRtl ? '-right-5' : '-left-5'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-sky-600 border border-sky-100 opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-sky-50 hidden md:flex`}
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => scroll('right')} 
            className={`absolute ${isRtl ? '-left-5' : '-right-5'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-sky-600 border border-sky-100 opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-sky-50 hidden md:flex`}
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>

          <div 
            ref={scrollRef} 
            className="flex gap-4 md:gap-6 overflow-x-auto pb-8 snap-x no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[180px] md:min-w-[240px] animate-pulse">
                  <div className="aspect-square bg-sky-100/50 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-sky-100/50 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-sky-100/50 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="min-w-[180px] w-[180px] md:min-w-[240px] md:w-[240px] snap-start"
                >
                  <div className="relative">
                    {/* Special Sky Blue Badge */}
                    <div className="absolute -top-2 -right-2 z-30 bg-sky-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg transform rotate-6 border-2 border-white">
                      {isRtl ? 'عرض خاص' : 'SPECIAL'}
                    </div>
                    <ProductCard product={product} index={index} />
                  </div>
                </motion.div>
              ))
            )}

            {/* View More Card */}
            <div className="min-w-[140px] snap-start flex items-center justify-center p-4">
              <Link 
                href="/offers/weekend"
                className="flex flex-col items-center gap-3 text-sky-400 hover:text-sky-600 transition-all group/more"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-sky-200 flex items-center justify-center group-hover/more:border-sky-500 group-hover/more:bg-white transition-all">
                  <ChevronRight size={32} className={isRtl ? 'rotate-180' : ''} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'رؤية الكل' : 'View All'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
