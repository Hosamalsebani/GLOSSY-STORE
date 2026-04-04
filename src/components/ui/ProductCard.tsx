'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Minus, Star, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import QuickViewModal from './QuickViewModal';
import { getCurrencyUnit } from '@/utils/format';


interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { cart, addToCart, removeFromCart, updateQuantity, wishlist, toggleWishlist } = useAppStore();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isFavorite = wishlist.some((item) => item.id === product.id);

  const discountedPrice = product.discount_percentage 
    ? (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
    : null;

  const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;

  return (
    <div className="flex flex-col group h-full relative">
      {/* Product Image & Interactions Container */}
      <div className="relative aspect-square bg-[#f8f8f8] rounded-[24px] overflow-hidden p-4 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-black/5 group-hover:-translate-y-1">
        
        {/* Image wrapped in explicit Link for proper click hit-box isolation */}
        <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0 flex items-center justify-center p-4">
          <Image
            src={product.image_url || product.images?.[0] || '/images/placeholder-product.png'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 33vw, 200px"
            loading="lazy"
            className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110 p-4"
          />
        </Link>

        {/* Quantity Controls - Bottom (Floating Style) */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 z-[2]">
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  aria-label={isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}
                  title={isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}
                  className="w-10 h-10 rounded-full bg-white shadow-lg text-black flex items-center justify-center hover:bg-black hover:text-white transition-all border border-gray-100/50"
                >
                  <Plus size={20} strokeWidth={3} />
                </motion.button>
              ) : (
                <motion.div
                  key="quantity"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  className="h-10 bg-white shadow-xl rounded-full flex items-center justify-between border border-gray-100 px-1.5 overflow-hidden"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <button
                    onClick={() => {
                      if (quantity > 1) {
                        updateQuantity(product.id, quantity - 1);
                      } else {
                        removeFromCart(product.id);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="text-sm font-black text-black min-w-[20px] text-center">{quantity}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-[1] pointer-events-none">
            <span className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
              {isRtl ? 'نفذت الكمية' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info - Wrap title in Link */}
      <div className={`mt-4 flex flex-col ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex items-center gap-0.5">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-black text-gray-900">4.8</span>
          </div>
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
            {product.brand || 'GLOSSY'}
          </span>
        </div>

        <Link href={`/shop/${product.id}`} className="block w-full">
          <h3 className="text-[13px] font-black text-gray-800 line-clamp-2 min-h-[38px] leading-tight mb-2 group-hover:text-black transition-colors">
            {isRtl ? (product as any).name_ar || product.name : product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex flex-col">
          {discountedPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-black text-[#E23049] tracking-tight">
                {discountedPrice} <span className="text-[10px] uppercase">{getCurrencyUnit(locale)}</span>
              </span>
              <span className="text-[12px] text-gray-300 line-through font-bold">
                {product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-[17px] font-black text-gray-900 tracking-tight">
              {product.price.toFixed(2)} <span className="text-[10px] uppercase">{getCurrencyUnit(locale)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </div>
  );
}
