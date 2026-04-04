'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useRef, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function CategoryGrid() {
  const locale = useLocale();
  const t = useTranslations('HomePage');
  const isRtl = locale === 'ar';
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Use a cache-busting timestamp to ensure we get the latest data from Supabase
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name_en', { ascending: true });
        
        if (data) {
          // Verify that all images have a value, otherwise provide a standard fallback
          const sanitizedData = data.map(cat => ({
            ...cat,
            image_url: cat.image_url || `https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400`
          }));
          setCategories(sanitizedData);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = isRtl ? (direction === 'left' ? 200 : -200) : (direction === 'left' ? -200 : 200);
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <section className="py-2 md:py-4 bg-white overflow-hidden relative z-10">
      <div className="md:container md:mx-auto md:px-8">
        
        {/* Hide Title on Mobile for cleaner look like NiceOne */}
        <div className="hidden md:flex justify-between items-center mb-4 md:mb-6 px-4 md:px-0">
          <h2 className={`text-base md:text-xl font-bold text-[var(--color-luxury-black)] ${isRtl ? 'font-arabic' : ''}`}>
            {t('categoryTitle')}
          </h2>
          <div className="flex gap-2 mb-1">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-200 text-gray-400 hover:border-[var(--color-rose-gold)] hover:text-[var(--color-rose-gold)] transition-all active:scale-95 shadow-sm bg-white"
              aria-label="Previous Category"
            >
              {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-200 text-gray-400 hover:border-[var(--color-rose-gold)] hover:text-[var(--color-rose-gold)] transition-all active:scale-95 shadow-sm bg-white"
              aria-label="Next Category"
            >
              {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        <div 
            ref={scrollRef}
            className="grid grid-rows-2 grid-flow-col gap-x-6 md:gap-x-10 gap-y-4 overflow-x-auto pb-3 pt-2 px-4 md:px-0 snap-x [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {categories.map((category, index) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="snap-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.02, ease: 'easeOut' }}
                className="flex flex-col items-center gap-2.5 group cursor-pointer w-[76px] md:w-28"
              >
                <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] group-hover:scale-105 group-hover:border-[var(--color-rose-gold)]/40">
                  <img 
                    src={category.image_url} 
                    alt={locale === 'ar' ? category.name_ar : category.name_en}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400'; }}
                    className="object-cover w-full h-full transform transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <h3 className={`text-[10px] md:text-sm font-black text-[#111111] text-center w-full leading-tight line-clamp-1 truncate px-1 tracking-tight ${locale === 'ar' ? 'font-arabic' : ''}`}>
                  {locale === 'ar' ? category.name_ar : category.name_en}
                </h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
