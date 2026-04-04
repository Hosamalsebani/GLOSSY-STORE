'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Plus, Heart } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import ProductCard from '../ui/ProductCard';

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useAppStore();
  const supabase = createClient();
  const t = useTranslations('Shop');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(10);

        if (!error && data) setProducts(data);
      } catch (err) {
        console.error('Error fetching best sellers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
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

  const getDiscountedPrice = (price: number, discount: number | null | undefined) => {
    if (!discount || discount <= 0) return null;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  return (
    <section className="py-2 bg-white overflow-hidden">
      <div className="md:container md:mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {t('bestSellers') || (isRtl ? 'الأكثر مبيعاً' : 'Best Sellers')}
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
            className={`absolute ${isRtl ? '-right-5' : '-left-5'} top-[35%] z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex`}
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={() => scroll('right')} 
            className={`absolute ${isRtl ? '-left-5' : '-right-5'} top-[35%] z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex`}
          >
            <ChevronRight size={20} />
          </button>

          <div 
            className="flex gap-0 overflow-x-auto pb-4 snap-x no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="min-w-[160px] animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] snap-start"
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))

            )}
          </div>
        </div>
      </div>
    </section>
  );
}
