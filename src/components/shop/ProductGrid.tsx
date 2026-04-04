'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Star, Heart, AlertTriangle, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import FlashSaleTimer from './FlashSaleTimer';
import QuickViewModal from './QuickViewModal';

export default function ProductGrid({ products = [] }: { products?: Product[] }) {
  const { addToCart, toggleWishlist, wishlist } = useAppStore();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No products available at the moment.
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
      {products.map((product, index) => {
        const isWishlisted = wishlist.some(item => item.id === product.id);
        const isOutOfStock = (product.stock ?? 0) <= 0;
        const discountPct = product.discount_percentage ?? 0;
        const hasDiscount = discountPct > 0;
        const finalPrice = hasDiscount ? +(product.price * (1 - discountPct / 100)).toFixed(2) : product.price;

        return (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="group relative"
          >
            {/* Wishlist Button */}
            <button 
              aria-label="Toggle wishlist"
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product);
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
            >
              <Heart size={18} className={isWishlisted ? "fill-[var(--color-rose-gold)] text-[var(--color-rose-gold)]" : "text-gray-500"} />
            </button>

            {/* Discount Badge and Timer */}
            {!isOutOfStock && hasDiscount && (
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="discount-sticker min-w-[80px] justify-center">
                  <span className="relative z-10">-{discountPct}% OFF</span>
                </span>
                {product.sale_end_date && (
                  <FlashSaleTimer endDate={product.sale_end_date} compact />
                )}
              </div>
            )}

            <div className="relative aspect-[4/5] mb-4 overflow-hidden bg-gray-50 group-image-container">
              <Link href={`/shop/${product.slug || product.id}`} className="block h-full">
                {/* Primary Image */}
                <Image 
                  src={
                    product.image_url || 
                    (product.images && product.images.length > 0 ? product.images[0] : 
                    (product.additional_images && product.additional_images.length > 0 ? product.additional_images[0] : 
                    'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=400'))
                  } 
                  alt={product.name}
                  fill
                  className={`object-cover transform transition-all duration-700 ease-in-out ${isOutOfStock ? 'opacity-40 grayscale' : 'group-hover:scale-105 group-hover:opacity-0'}`}
                />

                {/* Secondary Image on Hover */}
                {!isOutOfStock && (product.additional_images && product.additional_images.length > 0 || product.images && product.images.length > 1) && (
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

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center z-[5]">
                    <span className="bg-white/90 text-red-600 font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-md shadow flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Out of Stock
                    </span>
                  </div>
                )}
              </Link>
              
              {/* Quick Add Overlay — desktop only (hover) */}
              {!isOutOfStock && (
                <div className="absolute inset-x-0 bottom-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end z-20 hidden md:flex">
                  <div className="w-full flex">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...product, price: finalPrice });
                      }}
                      className="flex-1 bg-[var(--color-luxury-black)] text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-[var(--color-rose-gold)] transition-colors flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <ShoppingBag size={18} /> Add to Cart
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickViewProduct(product);
                      }}
                      className="bg-white text-[var(--color-luxury-black)] px-4 py-4 hover:bg-[var(--color-rose-gold)] hover:text-white transition-colors flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 border-l border-gray-200"
                      aria-label="Quick view"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Quick View Button - always visible */}
              {!isOutOfStock && (
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
              )}
            </div>
            
            <Link href={`/shop/${product.slug || product.id}`} className="block text-center pb-2 px-1">
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-rose-gold)] mb-0.5 block truncate">{product.brand}</span>
                <h3 className="text-sm md:text-base font-serif mb-0.5 line-clamp-1 group-hover:text-[var(--color-rose-gold)] transition-colors">{product.name}</h3>
                <div className="flex justify-center items-center gap-1 mb-1">
                  <Star size={10} className="fill-gray-800 text-gray-800" />
                  <span className="text-[10px] text-gray-500">{product.rating}</span>
                </div>
                {/* Price with discount */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2">
                  {hasDiscount ? (
                    <>
                      <span className="font-bold text-red-600 text-xs md:text-base">{finalPrice} د.ل</span>
                      <span className="text-[10px] md:text-sm text-gray-400 line-through">{product.price} د.ل</span>
                    </>
                  ) : (
                    <span className="font-bold text-[var(--color-luxury-black)] text-xs md:text-base">{product.price} د.ل</span>
                  )}
                </div>
            </Link>
          </motion.div>
        );
      })}
    </div>

    <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
