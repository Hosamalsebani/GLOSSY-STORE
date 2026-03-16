'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAppStore } from '@/store';
import { Product } from '@/types';
import { useLocale } from 'next-intl';

type QuickViewModalProps = {
  product: Product | null;
  onClose: () => void;
};

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, toggleWishlist, wishlist } = useAppStore();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCurrentImageIndex(0);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!product) return null;

  const allImages = [
    product.image_url, 
    ...(product.images || []), 
    ...(product.additional_images || [])
  ].filter(Boolean) as string[];

  if (allImages.length === 0) allImages.push('/images/placeholder-product.png');

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;
  const discountPct = product.discount_percentage ?? 0;
  const hasDiscount = discountPct > 0;
  const finalPrice = hasDiscount ? +(product.price * (1 - discountPct / 100)).toFixed(2) : product.price;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, price: finalPrice });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-3xl max-h-[92vh] md:max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10"
          >
            {/* Mobile drag handle */}
            <div className="md:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-black hover:bg-white transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Image Section */}
            <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-gray-50 flex-shrink-0">
              <img
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Image Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentImageIndex 
                            ? 'bg-[var(--color-luxury-black)] w-5' 
                            : 'bg-white/70 hover:bg-white'
                        }`}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-black rounded-full shadow-lg">
                    -{discountPct}% {isRtl ? 'خصم' : 'OFF'}
                  </span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col overflow-y-auto">
              {/* Brand */}
              {product.brand && (
                <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-rose-gold)] font-bold mb-2">
                  {product.brand}
                </span>
              )}

              {/* Name */}
              <h2 className={`text-xl md:text-2xl font-serif text-[var(--color-luxury-black)] mb-3 leading-tight ${isRtl ? 'font-arabic' : ''}`}>
                {isRtl && (product as any).name_ar ? (product as any).name_ar : product.name}
              </h2>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">({product.review_count || 0})</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className={`text-2xl font-black ${hasDiscount ? 'text-red-600' : 'text-[var(--color-luxury-black)]'}`}>
                  {finalPrice.toFixed(2)} د.ل
                </span>
                {hasDiscount && (
                  <span className="text-base text-gray-400 line-through">{product.price.toFixed(2)} د.ل</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className={`text-sm text-gray-600 leading-relaxed mb-6 line-clamp-4 ${isRtl ? 'font-arabic' : ''}`}>
                  {product.description}
                </p>
              )}

              {/* Category */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                  {isRtl ? 'الفئة' : 'Category'}
                </span>
                <p className="text-sm text-gray-700 font-medium capitalize mt-0.5">
                  {product.category}
                </p>
              </div>

              {/* Spacer */}
              <div className="flex-grow" />

              {/* Actions */}
              {isOutOfStock ? (
                <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-xl text-sm font-bold uppercase tracking-widest">
                  {isRtl ? 'نفذت الكمية' : 'Out of Stock'}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                      {isRtl ? 'الكمية' : 'Qty'}
                    </span>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-[var(--color-luxury-black)] border-x border-gray-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart + Wishlist */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-[var(--color-luxury-black)] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--color-rose-gold)] transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <ShoppingBag size={16} />
                      {isRtl ? 'أضف للسلة' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90 ${
                        isWishlisted 
                          ? 'border-[var(--color-rose-gold)] bg-[var(--color-rose-gold)]/10 text-[var(--color-rose-gold)]' 
                          : 'border-gray-200 text-gray-400 hover:border-[var(--color-rose-gold)] hover:text-[var(--color-rose-gold)]'
                      }`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* View Full Details */}
                  <Link
                    href={`/shop/${product.id}`}
                    onClick={onClose}
                    className="block text-center text-xs text-gray-400 uppercase tracking-widest font-medium hover:text-[var(--color-rose-gold)] transition-colors py-2"
                  >
                    {isRtl ? 'عرض كل التفاصيل ←' : 'View Full Details →'}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
