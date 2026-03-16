'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Tag, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import QuickViewModal from '@/components/shop/QuickViewModal';

type ShopByCategoryProps = {
  title: string;
  category: string;
  bgColor?: string;
};

export default function ShopByCategory({ title, category, bgColor = 'bg-white' }: ShopByCategoryProps) {
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
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('category', `%${category}%`)
          .limit(8);

        if (!error && data) setProducts(data);
      } catch (err) {
        console.error(`Error fetching ${category}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, supabase]);

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
    <section className={`py-12 md:py-20 ${bgColor} overflow-hidden`}>
      <div className="px-4 md:container md:mx-auto md:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <h2 className={`text-2xl md:text-3xl font-serif text-[var(--color-luxury-black)] mb-2 uppercase tracking-tight ${isRtl ? 'font-arabic' : ''}`}>
              <span className="relative">
                {title}
                <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gold-luxury-gradient rounded-full" />
              </span>
            </h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-[0.2em] uppercase mt-4">
              {t('curatedSelection')}
            </p>
          </div>
          <Link 
            href={`/category/${category}`} 
            className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:border-gold-luxury hover:text-gold-luxury transition-all duration-300 shadow-sm"
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
            suppressHydrationWarning
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => scroll('right')} 
            className={`absolute ${isRtl ? '-left-4' : '-right-4'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl items-center justify-center text-gray-800 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all duration-300 hidden md:flex opacity-0 group-hover/carousel:opacity-100 scale-90 group-hover/carousel:scale-100`}
            aria-label="Scroll right"
            suppressHydrationWarning
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
                  <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="w-full text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                <Tag className="mx-auto mb-4 text-gray-300" size={40} />
                <p className="text-gray-400 text-sm font-medium">{t('noProductsInCategory')}</p>
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
                      <div className="relative border border-gray-50 rounded-2xl overflow-hidden bg-white shadow-sm group-hover/item:shadow-xl transition-all duration-500">
                        {/* Premium Discount Sticker */}
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <div className="absolute top-4 left-4 z-20">
                            <div className="relative">
                              <div className="absolute inset-0 bg-red-500 blur-md opacity-40 animate-pulse"></div>
                              <span className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600 text-white font-black text-[10px] md:text-xs shadow-lg transform -rotate-12 border-2 border-white/20">
                                <span className="flex flex-col items-center leading-none">
                                  <span>{product.discount_percentage}%</span>
                                  <span className="text-[6px] md:text-[8px] uppercase tracking-tighter opacity-80">{isRtl ? 'خصم' : 'OFF'}</span>
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
                                {isRtl ? 'نفذت الكمية' : 'Out of Stock'}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons Overlay - Desktop only */}
                          {!isOutOfStock && (
                            <div className="absolute bottom-4 left-0 right-0 px-4 gap-2 translate-y-4 opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-500 z-20 hidden md:flex">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                                className="flex-1 bg-white/95 backdrop-blur-sm text-[var(--color-luxury-black)] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-rose-gold)] hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                              >
                                <Plus size={14} strokeWidth={3} /> {isRtl ? 'أضف للسلة' : 'Add to Cart'}
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                                className="bg-white/95 backdrop-blur-sm text-[var(--color-luxury-black)] p-3 rounded-xl hover:bg-[var(--color-rose-gold)] hover:text-white transition-all shadow-lg flex items-center justify-center active:scale-95"
                                aria-label="Quick view"
                              >
                                <Eye size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}

                          {/* Mobile Quick View Button */}
                          {!isOutOfStock && (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                              className="md:hidden absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[var(--color-luxury-black)] active:scale-90 transition-transform"
                              aria-label="Quick view"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-4 md:p-6 text-center">
                          <p className="text-[8px] md:text-[10px] gold-gradient-text font-black uppercase tracking-[0.2em] mb-1">
                            {category}
                          </p>
                          <h3 className={`text-sm md:text-lg font-serif text-[var(--color-luxury-black)] mb-2 line-clamp-1 h-6 ${isRtl ? 'font-arabic' : ''}`}>
                            {isRtl && (product as any).name_ar ? (product as any).name_ar : product.name}
                          </h3>
                          
                          <div className="flex items-center justify-center gap-3">
                            {discountedPrice ? (
                              <div className="luxury-price-fog">
                                <span className="font-black text-sm md:text-xl gold-gradient-text relative z-10">${discountedPrice}</span>
                                <span className="text-[10px] md:text-xs text-slate-300 line-through ml-2 opacity-60 relative z-10">${product.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              index % 2 === 0 ? (
                                <div className="luxury-price-fog">
                                  <span className="font-black text-sm md:text-xl gold-gradient-text relative z-10">
                                    ${product.price.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-black text-sm md:text-xl text-[var(--color-luxury-black)]">
                                  ${product.price.toFixed(2)}
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
            
            {/* "View More" card at the end */}
            {!loading && products.length > 0 && (
              <div className="min-w-[160px] md:min-w-[240px] snap-start flex items-center justify-center">
                <Link 
                  href={`/category/${category}`}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[var(--color-rose-gold)] hover:text-[var(--color-rose-gold)] hover:bg-[var(--color-rose-gold)]/5 transition-all group/view-more"
                >
                  <ChevronRight size={32} className={`transition-transform group-hover/view-more:translate-x-1 ${isRtl ? 'rotate-180 group-hover/view-more:-translate-x-1' : ''}`} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>

    <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
