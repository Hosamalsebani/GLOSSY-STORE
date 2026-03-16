'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Star, Plus, Flame, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import QuickViewModal from '@/components/shop/QuickViewModal';

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useAppStore();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
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
    <>
    <section className="py-12 md:py-20 bg-[var(--color-soft-beige)] overflow-hidden">
      <div className="px-4 md:container md:mx-auto md:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-red-500 fill-red-500" size={18} />
              <span className="text-[10px] md:text-sm text-red-500 font-bold tracking-widest uppercase">{t('trending')}</span>
            </div>
            <h2 className={`text-2xl md:text-4xl font-serif text-[var(--color-luxury-black)] uppercase tracking-tight ${isRtl ? 'font-arabic' : ''}`}>
              <span className="border-b-2 border-[var(--color-rose-gold)] pb-1">{t('bestSellers')}</span>
            </h2>
          </div>
          <Link 
            href="/shop" 
            className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-[var(--color-luxury-black)] text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-[var(--color-luxury-black)] hover:text-white transition-all duration-300 shadow-sm"
          >
            {t('viewAll')}
            <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          <button 
            onClick={() => scroll('left')} 
            className={`absolute ${isRtl ? '-right-4' : '-left-4'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl items-center justify-center text-gray-800 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all duration-300 hidden md:flex opacity-0 group-hover/carousel:opacity-100 scale-90 group-hover/carousel:scale-100`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => scroll('right')} 
            className={`absolute ${isRtl ? '-left-4' : '-right-4'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl items-center justify-center text-gray-800 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all duration-300 hidden md:flex opacity-0 group-hover/carousel:opacity-100 scale-90 group-hover/carousel:scale-100`}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>

          <div 
            ref={scrollRef} 
            className="flex gap-4 md:gap-8 overflow-x-auto pb-6 snap-x no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[200px] md:min-w-[320px] animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200/50 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200/50 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200/50 rounded w-1/2"></div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="w-full text-center py-20">
                <p className="text-gray-400 text-sm">{t('noProductsFound')}</p>
              </div>
            ) : (
              products.map((product, index) => {
                const discountedPrice = getDiscountedPrice(product.price, product.discount_percentage);
                const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="min-w-[220px] md:min-w-[320px] snap-start"
                  >
                    <Link href={`/shop/${product.id}`} className="block group/item">
                      <div className="relative border border-white rounded-2xl overflow-hidden bg-white shadow-sm group-hover/item:shadow-xl transition-all duration-500">
                        {/* Premium Sticker Overlay */}
                        <div className="absolute top-4 right-4 z-20">
                           <span className="px-3 py-1 text-[8px] md:text-[10px] uppercase tracking-widest font-black rounded-full bg-[var(--color-luxury-black)] text-white shadow-lg border border-white/20">
                            {t('bestSeller')}
                          </span>
                        </div>

                        {/* Premium Discount Sticker */}
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <div className="absolute top-4 left-4 z-20">
                            <div className="relative">
                              <div className="absolute inset-0 bg-red-500 blur-md opacity-40 animate-pulse"></div>
                              <span className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600 text-white font-black text-[10px] md:text-xs shadow-lg transform -rotate-12 border-2 border-white/20">
                                <span className="flex flex-col items-center leading-none">
                                  <span>{product.discount_percentage}%</span>
                                  <span className="text-[6px] md:text-[8px] uppercase tracking-tighter opacity-80">{t('discountOff')}</span>
                                </span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Product Image Wrapper */}
                        <div className="aspect-[4/5] overflow-hidden relative">
                          <img
                            src={product.image_url || product.images?.[0] || '/images/placeholder-product.png'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/item:scale-110"
                            loading="lazy"
                          />
                          
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />

                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                              <span className="bg-[var(--color-luxury-black)] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {t('outOfStock')}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons Overlay - Desktop only (hover) */}
                          {!isOutOfStock && (
                            <div className="absolute bottom-4 left-0 right-0 px-4 gap-2 translate-y-4 opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-500 z-20 hidden md:flex">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                                className="flex-1 bg-white/95 backdrop-blur-sm text-[var(--color-luxury-black)] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-rose-gold)] hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                              >
                                <Plus size={14} strokeWidth={3} /> {t('addToCart')}
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                                className="bg-white/95 backdrop-blur-sm text-[var(--color-luxury-black)] p-3 rounded-xl hover:bg-[var(--color-rose-gold)] hover:text-white transition-all shadow-lg flex items-center justify-center active:scale-95"
                                aria-label={t('quickView')}
                              >
                                <Eye size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}

                          {/* Mobile Quick View Button - always visible */}
                          {!isOutOfStock && (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                              className="md:hidden absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[var(--color-luxury-black)] active:scale-90 transition-transform"
                              aria-label={t('quickView')}
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-4 md:p-6 text-center">
                          {product.rating && (
                            <div className="flex items-center justify-center gap-0.5 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={10} 
                                  className={i < Math.round(product.rating!) ? 'fill-[var(--color-rose-gold)] text-[var(--color-rose-gold)]' : 'text-gray-200'}
                                  strokeWidth={3}
                                />
                              ))}
                            </div>
                          )}
                          <h3 className={`text-sm md:text-lg font-serif text-[var(--color-luxury-black)] mb-2 line-clamp-1 h-6 ${isRtl ? 'font-arabic' : ''}`}>
                            {isRtl && (product as any).name_ar ? (product as any).name_ar : product.name}
                          </h3>
                          
                          <div className="flex items-center justify-center gap-3">
                              {discountedPrice ? (
                                <div className="luxury-price-fog">
                                  <span className="font-black text-sm md:text-xl gold-gradient-text relative z-10">{discountedPrice} د.ل</span>
                                  <span className="text-[10px] md:text-xs text-slate-300 line-through ml-2 opacity-60 relative z-10">{product.price.toFixed(2)} د.ل</span>
                                </div>
                              ) : (
                                index % 2 === 0 ? (
                                  <div className="luxury-price-fog">
                                    <span className="font-black text-sm md:text-xl gold-gradient-text relative z-10">
                                      {product.price.toFixed(2)} د.ل
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-black text-sm md:text-xl text-[var(--color-luxury-black)]">
                                    {product.price.toFixed(2)} د.ل
                                  </span>
                                )
                              )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>

    <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
