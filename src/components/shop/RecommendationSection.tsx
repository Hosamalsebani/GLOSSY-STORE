'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import QuickViewModal from './QuickViewModal';

interface RecommendationSectionProps {
  title?: string;
  currentProductCategory?: string;
  excludeProductId?: string;
}

export default function RecommendationSection({ 
  title = "Products You May Like", 
  currentProductCategory,
  excludeProductId 
}: RecommendationSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { recentlyViewedIds, addToCart } = useAppStore();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const supabase = createClient();
  const locale = useLocale();
  const t = useTranslations('Shop');
  const isRtl = locale === 'ar';

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let recommendedProducts: Product[] = [];

        // 1. Try to fetch products based on recently viewed IDs
        const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const validRecentlyViewedIds = recentlyViewedIds.filter(isUUID);

        if (validRecentlyViewedIds.length > 0) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', validRecentlyViewedIds.slice(0, 6))
            .filter('id', 'neq', excludeProductId || '');

          if (!error && data) {
            recommendedProducts = [...data];
          }
        }

        // 2. Supplement with products from the same category if available
        if (recommendedProducts.length < 6 && currentProductCategory) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', currentProductCategory)
            .filter('id', 'neq', excludeProductId || '')
            .limit(10);

          if (!error && data) {
            // Avoid duplicates
            const existingIds = new Set(recommendedProducts.map(p => p.id));
            const newProducts = data.filter(p => !existingIds.has(p.id));
            recommendedProducts = [...recommendedProducts, ...newProducts].slice(0, 10);
          }
        }

        // 3. Fallback to trending/new products if still low
        if (recommendedProducts.length < 4) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (!error && data) {
            const existingIds = new Set(recommendedProducts.map(p => p.id));
            const newProducts = data.filter(p => !existingIds.has(p.id));
            recommendedProducts = [...recommendedProducts, ...newProducts].slice(0, 10);
          }
        }

        setProducts(recommendedProducts);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [recentlyViewedIds, currentProductCategory, excludeProductId, supabase]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = isRtl ? (direction === 'left' ? 280 : -280) : (direction === 'left' ? -280 : 280);
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <>
    <section className="py-12 md:py-20 bg-[var(--color-soft-bg)] border-t border-gray-50">
      <div className="px-4 md:container md:mx-auto md:px-8">
        <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl md:text-3xl font-serif text-[var(--color-luxury-black)] ${isRtl ? 'font-arabic' : ''}`}>
            {title === "Products You May Like" ? t('recommendationsTitle') : title}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')} 
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all"
              aria-label="Previous products"
            >
              {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
<span className="sr-only">Previous</span>
            <button 
              onClick={() => scroll('right')} 
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all"
              aria-label="Next products"
            >
              {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
<span className="sr-only">Next</span>
          </div>
        </div>

        <div 
          ref={scrollRef} 
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        >
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[200px] md:min-w-[300px] animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <div key={product.id} className="min-w-[200px] md:min-w-[300px] snap-start group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Link href={`/shop/${product.id}`} className="block h-full relative group-image-container">
                    <Image
                      src={product.image_url || (product.images && product.images.length > 0 ? product.images[0] : '')}
                      alt={product.name}
                      fill
                      className="object-cover transform transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-0"
                    />
                    
                    {/* Secondary Image on Hover */}
                    {(product.additional_images && product.additional_images.length > 0 || product.images && product.images.length > 1) && (
                      <Image 
                        src={
                          (product.additional_images && product.additional_images.length > 0) 
                            ? product.additional_images[0] 
                            : (product.images && product.images.length > 1 ? product.images[1] : '')
                        } 
                        alt={`${product.name} alternate`}
                        fill
                        className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                  </Link>
                  
                  {/* Desktop: Add to Cart + Quick View on hover */}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20 hidden md:flex">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="w-10 h-10 rounded-full bg-white text-[var(--color-luxury-black)] flex items-center justify-center shadow-lg hover:bg-[var(--color-rose-gold)] hover:text-white transition-colors"
                      aria-label="Add to cart"
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickViewProduct(product);
                      }}
                      className="w-10 h-10 rounded-full bg-white text-[var(--color-luxury-black)] flex items-center justify-center shadow-lg hover:bg-[var(--color-rose-gold)] hover:text-white transition-colors"
                      aria-label="Quick view"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  {/* Mobile: Quick View button always visible */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setQuickViewProduct(product);
                    }}
                    className="md:hidden absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[var(--color-luxury-black)] active:scale-90 transition-transform"
                    aria-label="Quick view"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                <Link href={`/shop/${product.id}`} className="block">
                  <div>
                    <h3 className={`text-sm md:text-base font-semibold text-gray-800 mb-1 truncate ${isRtl ? 'font-arabic' : ''}`}>
                      {isRtl && product.name_ar ? product.name_ar : product.name}
                    </h3>
                    <p className={`text-[var(--color-rose-gold)] font-bold ${isRtl ? 'text-left' : 'text-right'}`}>${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </section>

    <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
