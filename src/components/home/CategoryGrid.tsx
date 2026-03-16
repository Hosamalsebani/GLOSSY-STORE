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
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name_en', { ascending: true });
        
        if (data) setCategories(data);
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
    <section className="py-12 md:py-20 bg-white overflow-hidden">
      <div className="px-4 md:container md:mx-auto md:px-8">
        
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div className="max-w-xl">
             <h2 className={`text-2xl md:text-4xl font-serif text-[var(--color-luxury-black)] mb-2 md:mb-4 uppercase tracking-tight ${isRtl ? 'font-arabic' : ''}`}>
              <span className="border-b-2 border-[var(--color-rose-gold)] pb-1">{t('categoryTitle')}</span>
            </h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-light tracking-wide uppercase">
              {t('categorySubtitle')}
            </p>
          </div>
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
          className="flex gap-6 md:gap-14 overflow-x-auto pb-8 snap-x no-scrollbar pt-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category, index) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="snap-center flex-shrink-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-5 group cursor-pointer"
              >
                <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--color-rose-gold)] transition-all duration-700 shadow-xl group-hover:shadow-[0_20px_50px_rgba(202,152,102,0.15)] ring-4 ring-gray-50/50 group-hover:ring-[var(--color-rose-gold)]/20 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                      src={category.image_url} 
                      alt={locale === 'ar' ? category.name_ar : category.name_en}
                      className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 group-hover:to-transparent transition-all duration-500" />
                </div>
                
                <h3 className={`text-[10px] md:text-sm font-bold uppercase tracking-[0.25em] text-[var(--color-luxury-black)] group-hover:text-[var(--color-rose-gold)] transition-colors text-center max-w-[120px] md:max-w-[150px] leading-relaxed ${locale === 'ar' ? 'font-arabic' : ''}`}>
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
