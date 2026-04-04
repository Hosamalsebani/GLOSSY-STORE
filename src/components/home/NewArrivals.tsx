'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';

export default function NewArrivals() {
  const locale = useLocale();
  const t = useTranslations('Shop');
  const isRtl = locale === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useAppStore();
  const supabase = createClient();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) setProducts(data);
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [supabase]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = isRtl ? (direction === 'left' ? 280 : -280) : (direction === 'left' ? -280 : 280);
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-2 bg-white">
      <div className="md:container md:mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {t('newArrivals') || (isRtl ? 'وصل حديثاً' : 'New Arrivals')}
          </h2>
          <Link 
            href="/shop" 
            className="flex items-center gap-1 text-gray-500 text-sm font-bold hover:text-black transition-colors"
          >
            {t('viewAll')}
            <ChevronRight size={16} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Nav Buttons (Desktop) */}
          <button 
            onClick={() => scroll('left')} 
            aria-label={isRtl ? 'التالي' : 'Previous'}
            title={isRtl ? 'التالي' : 'Previous'}
            className={`absolute ${isRtl ? '-right-5' : '-left-5'} top-[40%] z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex`}
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={() => scroll('right')} 
            aria-label={isRtl ? 'السابق' : 'Next'}
            title={isRtl ? 'السابق' : 'Next'}
            className={`absolute ${isRtl ? '-left-5' : '-right-5'} top-[40%] z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex`}
          >
            <ChevronRight size={20} />
          </button>

          <div 
            className="flex gap-0 overflow-x-auto pb-4 snap-x no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="min-w-[160px] animate-pulse">
                  <div className="aspect-[3/4] bg-gray-50 rounded-2xl mb-3"></div>
                  <div className="h-4 bg-gray-50 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <div
                  key={product.id}
                  className="min-w-[160px] w-[160px] md:min-w-[220px] md:w-[220px] snap-start"
                >
                  <ProductCard product={product} index={index} />
                </div>
              ))
            )}

            {/* "View More" card at the end */}
            {!loading && products.length > 0 && (
              <div className="min-w-[160px] snap-start flex items-center justify-center">
                <Link 
                  href="/shop"
                  className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all group/view-more"
                >
                  <ChevronRight size={24} className={isRtl ? 'rotate-180' : ''} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
