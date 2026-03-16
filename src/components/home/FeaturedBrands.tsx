'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Plus, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import QuickViewModal from '@/components/shop/QuickViewModal';

export default function FeaturedBrands() {
  const locale = useLocale();
  const t = useTranslations('Shop');
  const isRtl = locale === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useAppStore();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
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
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = isRtl ? (direction === 'left' ? 260 : -260) : (direction === 'left' ? -260 : 260);
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
    <>
    <section className="py-10 md:py-20 bg-white">
      <div className="px-4 md:container md:mx-auto md:px-8">
        {/* Section Title */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className={`text-2xl md:text-4xl font-serif text-[var(--color-luxury-black)] inline-block ${isRtl ? 'font-arabic' : ''}`}>
            <span className="border-b-2 border-[var(--color-rose-gold)] pb-1 md:pb-2 tracking-tight">{t('newArrivals')}</span>
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative group">
          {/* Arrows - hidden on mobile */}
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg items-center justify-center text-gray-700 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all hidden md:flex"
            aria-label="Scroll left"
          >
            {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button 
            onClick={() => scroll('right')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[var(--color-rose-gold)] shadow-lg items-center justify-center text-white hover:bg-[var(--color-luxury-black)] transition-all hidden md:flex"
            aria-label="Scroll right"
          >
            {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Products */}
          <div 
            ref={scrollRef} 
            className="flex gap-3 md:gap-5 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[160px] md:min-w-[280px] animate-pulse">
                  <div className="aspect-[3/4] bg-gray-100 rounded-xl mb-3"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5"></div>
                  <div className="h-2.5 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="w-full text-center py-12 text-gray-500 text-sm">
                <p>{t('noNewArrivals')}</p>
              </div>
            ) : (
              products.map((product, index) => {
                const discountedPrice = getDiscountedPrice(product.price, product.discount_percentage);
                const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="min-w-[160px] md:min-w-[280px] snap-start"
                  >
                    <Link href={`/shop/${product.id}`} className="block">
                      <div className="relative border border-gray-100 rounded-xl overflow-hidden bg-white group/card hover:shadow-md transition-shadow">
                        {/* Badge */}
                        <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                          {index < 3 && (
                            <span className="px-2 py-0.5 text-[8px] md:text-[10px] uppercase tracking-wider font-bold rounded-full bg-[var(--color-rose-gold)] text-white">
                              {t('newBadge')}
                            </span>
                          )}
                          {product.discount_percentage && product.discount_percentage > 0 && (
                            <span className="px-2 py-0.5 text-[8px] md:text-[10px] uppercase tracking-wider font-bold rounded-full bg-red-500 text-white">
                              -{product.discount_percentage}%
                            </span>
                          )}
                        </div>

                        {/* Mobile Buttons - always visible */}
                        {!isOutOfStock && (
                          <div className="md:hidden absolute bottom-2 right-2 z-10 flex gap-1.5">
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                              className="w-8 h-8 rounded-full bg-[var(--color-rose-gold)] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                              aria-label={`Add ${product.name} to cart`}
                            >
                              <Plus size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                              className="w-8 h-8 rounded-full bg-white/90 text-[var(--color-luxury-black)] flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                              aria-label="Quick view"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        )}

                        {/* Product Image */}
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={product.image_url || product.images?.[0] || ''}
                            alt={isRtl ? product.name_ar || product.name : product.name}
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">{t('outOfStock')}</span>
                            </div>
                          )}
                        </div>

                        {/* Desktop Quick Add + Quick View */}
                        {!isOutOfStock && (
                          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover/card:opacity-100 transition-all duration-300 hidden md:flex">
                            <button
                              onClick={(e) => { e.preventDefault(); addToCart(product); }}
                              className="flex-1 bg-[var(--color-luxury-black)] text-white py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[var(--color-rose-gold)] transition-colors flex items-center justify-center gap-2"
                              aria-label={`Add ${isRtl ? product.name_ar || product.name : product.name} to cart`}
                            >
                              <ShoppingBag size={14} /> {t('quickAdd')}
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                              className="bg-white text-[var(--color-luxury-black)] px-3 py-2.5 hover:bg-[var(--color-rose-gold)] hover:text-white transition-colors flex items-center justify-center border-l border-gray-200"
                              aria-label="Quick view"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="pt-2.5 md:pt-4 px-0.5">
                      <h3 className={`font-semibold text-xs md:text-sm text-[var(--color-luxury-black)] mb-0.5 line-clamp-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {isRtl ? product.name_ar || product.name : product.name}
                      </h3>
                      <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                        {discountedPrice ? (
                          <>
                            <span className="font-bold text-xs md:text-sm text-[var(--color-luxury-black)]">${discountedPrice}</span>
                            <span className="text-[10px] md:text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-bold text-xs md:text-sm text-[var(--color-luxury-black)]">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* View All */}
        <div className="text-center mt-8">
          <Link 
            href="/shop" 
            className="inline-block px-6 py-2.5 border-2 border-[var(--color-luxury-black)] text-[var(--color-luxury-black)] text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-[var(--color-luxury-black)] hover:text-white transition-all active:scale-95"
          >
            {t('viewAll')}
          </Link>
        </div>
      </div>
    </section>

    <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
