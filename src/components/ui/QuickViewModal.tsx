'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import { getCurrencyUnit } from '@/utils/format';

import { useState } from 'react';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { addToCart, wishlist, toggleWishlist } = useAppStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || (product.image_url ? [product.image_url] : ['/images/placeholder-product.png']);
  const isFavorite = wishlist.some(item => item.id === product.id);

  const discountedPrice = product.discount_percentage 
    ? (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
    : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label={isRtl ? 'إغلاق' : 'Close'}
            title={isRtl ? 'إغلاق' : 'Close'}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-500 hover:text-black transition-all border border-gray-100`}
          >
            <X size={20} />
          </button>

          {/* Left Side: Image Gallery */}
          <div className="w-full md:w-1/2 bg-[#f9f9f9] relative group">
            <div className="aspect-square w-full h-full flex items-center justify-center p-8 md:p-12">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                src={images[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Gallery Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  aria-label={isRtl ? 'الصورة السابقة' : 'Previous Image'}
                  title={isRtl ? 'الصورة السابقة' : 'Previous Image'}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-gray-400 hover:text-black transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  aria-label={isRtl ? 'الصورة التالية' : 'Next Image'}
                  title={isRtl ? 'الصورة التالية' : 'Next Image'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-gray-400 hover:text-black transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-black' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side: Product Details */}
          <div className={`w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-yellow-400/10 text-yellow-600 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 border-none" />
                  <span className="text-xs font-bold">4.8</span>
               </div>
               <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  GLOSSY {product.brand && `• ${product.brand}`}
               </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
              {isRtl ? product.name_ar || product.name : product.name}
            </h2>

            <div className="flex items-baseline gap-3 mb-6">
              {discountedPrice ? (
                <>
                  <span className="text-3xl font-black text-[#E23049]">
                    {discountedPrice} {getCurrencyUnit(locale)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {product.price.toFixed(2)} {getCurrencyUnit(locale)}
                  </span>
                  <span className="bg-[#E23049]/10 text-[#E23049] text-xs font-bold px-2 py-1 rounded-md">
                    -{product.discount_percentage}% {isRtl ? 'خصم' : 'OFF'}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-gray-900">
                  {product.price.toFixed(2)} {getCurrencyUnit(locale)}
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-4">
              {isRtl ? product.description_ar || product.description : product.description}
            </p>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                  aria-label={isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}
                  title={isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}
                  className="flex-1 h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                >
                  <ShoppingBag size={20} />
                  {isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label={isRtl ? 'إضافة للمفضلة' : 'Toggle Wishlist'}
                  title={isRtl ? 'إضافة للمفضلة' : 'Toggle Wishlist'}
                  className={`w-14 h-14 rounded-2xl border ${isFavorite ? 'border-[#E23049] bg-[#E23049]/5 text-[#E23049]' : 'border-gray-200 text-gray-400'} flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95`}
                >
                  <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={isFavorite ? 0 : 1.5} />
                </button>
              </div>

              <button className="h-12 border border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-400 text-sm font-bold hover:bg-gray-50 transition-all">
                <Share2 size={16} />
                {isRtl ? 'مشاركة المنتج' : 'Share Product'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {isRtl ? 'متوفر في المخزون (شحن سريع)' : 'In Stock (Fast Shipping)'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
