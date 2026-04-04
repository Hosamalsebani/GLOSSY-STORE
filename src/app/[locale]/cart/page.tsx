'use client';

import { useAppStore } from '@/store';
import { Link } from '@/i18n/routing';
import { Trash2, ShoppingBag, ArrowRight, Share2, Check, Minus, Plus } from 'lucide-react';
import { useState, useEffect, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { decodeCart, generateShareUrl } from '@/utils/cart-share';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[var(--color-rose-gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CartContainer locale={locale} />
    </Suspense>
  );
}

function CartContainer({ locale }: { locale: string }) {
  const t = useTranslations('Cart');
  const { cart, removeFromCart, updateQuantity, addToCart } = useAppStore();
  const searchParams = useSearchParams();
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const supabase = createClient();

  const maxStock = (item: any) => item.stock ?? 999;

  useEffect(() => {
    const shareHash = searchParams.get('share');
    if (shareHash) {
      restoreCart(shareHash);
    }
  }, [searchParams]);

  const restoreCart = async (hash: string) => {
    setIsRestoring(true);
    try {
      const decoded = decodeCart(hash);
      if (decoded.length > 0) {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .in('id', decoded.map(d => d.id));

        if (products && !error) {
          products.forEach(product => {
            const sharedItem = decoded.find(d => d.id === product.id);
            if (sharedItem) {
              addToCart(product, sharedItem.quantity);
            }
          });
        }
      }
    } catch (err) {
      console.error('Error restoring cart:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const shareCart = () => {
    setIsSharing(true);
    const baseUrl = window.location.origin + window.location.pathname;
    const url = generateShareUrl(baseUrl, cart.map(item => ({ id: item.id, quantity: item.quantity })));
    
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setIsSharing(false);
      }, 2000);
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[70vh] flex flex-col justify-center items-center font-cairo">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-gray-300" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-[var(--color-luxury-black)]">{t('emptyTitle')}</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">{t('emptyMessage')}</p>
          <Link 
            href="/shop" 
            className="block w-full py-4 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] rounded-xl transition-all font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            {t('continueShopping')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-6 lg:py-16 font-cairo" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex items-baseline justify-between mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-luxury-black)] flex items-center gap-3 sm:gap-4">
            {t('title')}
            <span className="text-sm sm:text-lg font-medium text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
              {cart.length}
            </span>
          </h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-10">
          {/* Cart Items List */}
          <div className="w-full lg:w-2/3">
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-50 flex flex-row gap-4 sm:gap-6 relative group"
                  >
                    {/* Product Image */}
                    <Link href={`/shop/${item.id}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={item.image_url || (item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=400')} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-rose-gold)] mb-1 block line-clamp-1">
                            {item.brand}
                          </span>
                          <Link href={`/shop/${item.id}`} className="text-sm sm:text-xl font-bold text-[var(--color-luxury-black)] hover:text-[var(--color-rose-gold)] transition-colors line-clamp-2 leading-tight">
                            {item.name}
                          </Link>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="bg-gray-50 p-2 sm:p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                          title={t('remove')}
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity Control */}
                        <div className="flex items-center bg-gray-50 rounded-xl p-0.5 sm:p-1 border border-gray-100">
                          <button 
                            className="p-1.5 sm:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 active:scale-90"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            title="Decrease quantity"
                          >
                            <Minus size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <span className="px-3 sm:px-5 font-bold text-sm sm:text-lg min-w-[30px] sm:min-w-[50px] text-center">{item.quantity}</span>
                          <button 
                            className="p-1.5 sm:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 active:scale-90 disabled:opacity-20"
                            disabled={item.quantity >= maxStock(item)}
                            onClick={() => updateQuantity(item.id, Math.min(maxStock(item), item.quantity + 1))}
                            title="Increase quantity"
                          >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Price & Max Stock Alert */}
                        <div className="text-left rtl:text-right">
                          {item.quantity >= maxStock(item) && maxStock(item) < 999 && (
                            <span className="text-[9px] sm:text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100 mb-1 inline-block">
                              {t('maxStock')}: {maxStock(item)}
                            </span>
                          )}
                          <div className="text-lg sm:text-2xl font-bold text-[var(--color-luxury-black)] leading-none">
                            {item.price * item.quantity} <span className="text-xs sm:text-sm font-medium text-gray-400">د.ل</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="w-full lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 sticky top-24"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[var(--color-luxury-black)] border-b border-gray-50 pb-4">
                {t('orderSummary')}
              </h2>
              
              <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-500 font-medium">{t('subtotal')}</span>
                  <span className="text-lg sm:text-xl font-bold text-[var(--color-luxury-black)]">
                    {subtotal} <span className="text-[10px] sm:text-xs text-gray-400">د.ل</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-400">{t('shipping')}</span>
                  <span className="text-gray-400 font-medium italic">{t('calculatedAtCheckout')}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 flex justify-between items-center">
                <span className="text-base sm:text-lg font-bold text-[var(--color-luxury-black)]">{t('total')}</span>
                <div className="text-2xl sm:text-3xl font-black text-[var(--color-luxury-black)]">
                  {subtotal} <span className="text-xs sm:text-sm font-bold text-gray-400">د.ل</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Link 
                  href="/checkout" 
                  className="w-full bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] py-4 sm:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  {t('checkout')} <ArrowRight size={18} className="rtl:rotate-180 sm:w-5 sm:h-5" />
                </Link>

                <button
                  onClick={shareCart}
                  disabled={isSharing}
                  className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                    isCopied 
                      ? 'bg-green-50 border-green-200 text-green-600' 
                      : 'bg-white border-gray-100 text-[var(--color-luxury-black)] hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check size={16} /> {t('linkCopied')}
                    </>
                  ) : (
                    <>
                      <Share2 size={16} /> {t('shareCart')}
                    </>
                  )}
                </button>
              </div>

              {/* Secure Checkout Badge */}
              <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3 text-gray-400 text-[10px] sm:text-xs">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                100% Secure Checkout
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
