'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import FlashSaleTimer from '@/components/shop/FlashSaleTimer';
import StockNotificationForm from '@/components/shop/StockNotificationForm';
import RecommendationSection from '@/components/shop/RecommendationSection';
import ReviewList from '@/components/shop/ReviewList';
import ReviewForm from '@/components/shop/ReviewForm';
import { StarRating } from '@/components/shop/StarRating';
import { cn } from '@/utils/cn';
import { Product } from '@/types';

interface ProductDetailsClientProps {
  product: Product;
  locale: string;
}

export default function ProductDetailsClient({ product, locale }: ProductDetailsClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null)
  );
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [saleExpired, setSaleExpired] = useState(
    product.sale_end_date ? new Date(product.sale_end_date) < new Date() : false
  );
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart, toggleWishlist, wishlist, trackProductView } = useAppStore();

  useEffect(() => {
    trackProductView(product.id);
  }, [product.id, trackProductView]);

  useEffect(() => {
    setActiveTab('description');
  }, [locale]);

  const allImages = [
    ...(product?.image_url ? [product.image_url] : []),
    ...(product?.images || []),
    ...(product?.additional_images || [])
  ].filter((img, index, self) => img && self.indexOf(img) === index);

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const maxStock = product.stock ?? 0;
  const discountPct = (product.discount_percentage ?? 0) > 0 && !saleExpired ? product.discount_percentage! : 0;
  const hasDiscount = discountPct > 0;
  const finalPrice = hasDiscount ? +(product.price * (1 - discountPct / 100)).toFixed(2) : product.price;

  const ingredients = locale === 'ar' ? product.ingredients_ar : product.ingredients;
  const usage = locale === 'ar' ? product.usage_ar : product.usage;

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Product Images Area */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="relative aspect-square bg-gray-50 border border-gray-100">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name} 
                className={`object-cover w-full h-full transition-all duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 uppercase tracking-widest text-xs font-medium">No Image Available</div>
            )}

            {hasDiscount && !isOutOfStock && (
              <div className="absolute top-4 left-4 z-10">
                <span className="discount-sticker min-w-[90px] justify-center shadow-lg">
                  <span className="relative z-10">-{discountPct}% OFF</span>
                </span>
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                <span className="bg-white text-red-600 font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-md shadow-lg flex items-center gap-2">
                  <AlertTriangle size={18} /> {locale === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
                </span>
              </div>
            )}
          </div>
          
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  aria-label={`View image ${idx + 1}`}
                  className={`w-20 h-20 bg-gray-100 border transition-all duration-300 flex-shrink-0 ${selectedImage === img ? 'border-[var(--color-rose-gold)] ring-2 ring-[var(--color-rose-gold)]/10' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${idx + 1}`} 
                    className={`object-cover w-full h-full transition-opacity ${selectedImage === img ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Area */}
        <div className="w-full md:w-1/2 flex flex-col pt-4">
          <span className="text-sm uppercase tracking-[0.2em] font-bold text-[var(--color-rose-gold)] mb-3 block">
            {product.brand}
          </span>
          <h1 className="text-3xl md:text-5xl font-serif mb-6 text-[var(--color-luxury-black)] leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
            <StarRating 
              rating={product.rating || 0} 
              count={product.review_count || 0} 
              showText 
              className="mb-0"
            />
            <button 
              onClick={() => {
                setActiveTab('reviews');
                document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-[var(--color-rose-gold)] transition-colors"
            >
              Read Customer Reviews
            </button>
          </div>

          <div className="mb-8 flex items-center gap-4 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-medium text-red-600">{finalPrice} د.ل</span>
                <span className="text-xl text-gray-400 line-through decoration-1">{product.price} د.ل</span>
                <span className="bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-red-100 italic">
                  {locale === 'ar' ? 'وفر' : 'SAVE'} {discountPct}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-medium text-[var(--color-luxury-black)]">{product.price} د.ل</span>
            )}
          </div>

          {hasDiscount && product.sale_end_date && !saleExpired && (
            <div className="mb-6 p-4 bg-red-50/30 rounded-2xl border border-red-50">
               <FlashSaleTimer 
                endDate={product.sale_end_date} 
                onExpire={() => setSaleExpired(true)} 
              />
            </div>
          )}

          {!isOutOfStock && maxStock <= 5 && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-xs font-bold uppercase tracking-widest animate-pulse border border-amber-100">
              <AlertTriangle size={14} /> 
              {locale === 'ar' ? `بقي فقط ${maxStock} في المخزن!` : `Only ${maxStock} left in stock!`}
            </div>
          )}
          
          <p className="text-gray-500 mb-8 leading-relaxed font-light text-lg italic">
            {locale === 'ar' ? product.description_ar : product.description}
          </p>

          {/* Color Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 rounded-[24px] border border-gray-100 shadow-sm">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center justify-between text-gray-400">
                <span>{locale === 'ar' ? 'اختر اللون' : 'Choose Your Shade'}</span>
                {selectedVariant && (
                  <span className="text-[var(--color-rose-gold)]">
                    {locale === 'ar' ? selectedVariant.name_ar : selectedVariant.name_en}
                  </span>
                )}
              </h3>
              <div className="flex gap-4 flex-wrap">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    aria-label={`Select shade ${variant.name_en}`}
                    onClick={() => {
                      setSelectedVariant(variant);
                      if (variant.image_url) setSelectedImage(variant.image_url);
                    }}
                    className={cn(
                      "group relative w-10 h-10 rounded-full border-2 transition-all p-0.5",
                      selectedVariant === variant ? "border-[var(--color-rose-gold)] scale-110 shadow-md" : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <div 
                      className="w-full h-full rounded-full border border-black/5" 
                      style={{ backgroundColor: variant.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row py-8 mb-8 gap-4 border-t border-gray-100">
            <div className="flex items-center border border-gray-200 h-14">
              <button 
                className="w-12 h-full hover:bg-gray-50 transition-colors disabled:opacity-30 flex items-center justify-center font-bold text-lg"
                aria-label="Decrease quantity"
                disabled={isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button 
                className="w-12 h-full hover:bg-gray-50 transition-colors disabled:opacity-30 flex items-center justify-center font-bold text-lg"
                aria-label="Increase quantity"
                disabled={isOutOfStock || quantity >= maxStock}
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
              >+</button>
            </div>
            <button 
              disabled={isOutOfStock}
              onClick={() => addToCart({ ...product, price: finalPrice, selectedVariant }, quantity)}
              className={`flex-grow h-14 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-500 shadow-xl flex items-center justify-center gap-3 ${
                isOutOfStock 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] hover:-translate-y-1'
              }`}
            >
              <ShoppingBag size={18} /> {isOutOfStock ? (locale === 'ar' ? 'نفذت الكمية' : 'Out of Stock') : (locale === 'ar' ? 'أضف للسلة' : 'Add To Cart')}
            </button>
            <button 
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              onClick={() => toggleWishlist(product)}
              className={`w-14 h-14 border border-gray-200 hover:border-gray-400 transition-all flex items-center justify-center rounded-none sm:rounded-none overflow-hidden group ${isWishlisted ? "text-[var(--color-rose-gold)] border-[var(--color-rose-gold)]" : "text-gray-400"}`}
            >
              <Heart size={22} className={cn("transition-transform duration-300 group-hover:scale-110", isWishlisted ? "fill-[var(--color-rose-gold)]" : "")} />
            </button>
          </div>

          {isOutOfStock && (
            <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <StockNotificationForm productId={product.id} productName={product.name} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-12 border-t border-gray-100 pt-8">
            <div className="flex flex-col items-center sm:items-start gap-3">
              <ShieldCheck size={24} className="text-[var(--color-rose-gold)]" strokeWidth={1} />
              <span className="text-center sm:text-left">{locale === 'ar' ? 'أصلي 100%' : '100% Authentic'}</span>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-3">
              <Truck size={24} className="text-gray-400" strokeWidth={1} />
              <span className="text-center sm:text-left">{locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</span>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-3">
              <RotateCcw size={24} className="text-gray-400" strokeWidth={1} />
              <span className="text-center sm:text-left">{locale === 'ar' ? 'إرجاع سهل' : 'Easy Returns'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div id="product-tabs" className="mt-24 border-t border-gray-200">
        <div className="flex gap-10 pt-8 text-[11px] uppercase tracking-[0.2em] font-bold border-b border-gray-100 pb-4 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('description')}
            className={cn(
              "pb-4 -mb-[18px] transition-all whitespace-nowrap",
              activeTab === 'description' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-300 hover:text-gray-500"
            )}
          >
            {locale === 'ar' ? 'الوصف' : 'Description'}
          </button>
          <button 
            onClick={() => setActiveTab('ingredients')}
            className={cn(
              "pb-4 -mb-[18px] transition-all whitespace-nowrap",
              activeTab === 'ingredients' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-300 hover:text-gray-500"
            )}
          >
            {locale === 'ar' ? 'المكونات' : 'Ingredients'}
          </button>
          <button 
            onClick={() => setActiveTab('usage')}
            className={cn(
              "pb-4 -mb-[18px] transition-all whitespace-nowrap",
              activeTab === 'usage' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-300 hover:text-gray-500"
            )}
          >
            {locale === 'ar' ? 'طريقة الاستخدام' : 'How to Use'}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "pb-4 -mb-[18px] transition-all whitespace-nowrap",
              activeTab === 'reviews' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-300 hover:text-gray-500"
            )}
          >
            {locale === 'ar' ? `المراجعات (${product.review_count || 0})` : `Reviews (${product.review_count || 0})`}
          </button>
        </div>

        <div className="py-16 max-w-5xl">
          {activeTab === 'description' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="text-xl font-light text-gray-600 leading-relaxed mb-8 italic">{locale === 'ar' ? product.description_ar : product.description}</p>
              <div className="h-[1px] w-12 bg-gray-200 mb-8" />
              <p className="text-gray-500 leading-relaxed font-light">
                {locale === 'ar' 
                  ? "استمتع بتجربة الفخامة القصوى مع مجموعة GLOSSY المميزة. تم تصميم منتجاتنا بعناية فائقة باستخدام أجود المكونات لتقديم نتائج استثنائية ولمسة نهائية مثالية تدوم طوال اليوم. نحن نسعى دائماً لتقديم التميز في كل عبوة."
                  : "Experience the ultimate luxury with GLOSSY's premium collection. Our products are carefully crafted with the finest ingredients to deliver exceptional results and a flawless finish that lasts throughout the day. We strive for excellence in every bottle."
                }
              </p>
            </div>
          )}
          
          {activeTab === 'ingredients' && (
            <div className="max-w-3xl bg-gray-50 p-10 rounded-[32px] border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
              <h4 className="text-2xl font-serif mb-6 text-[var(--color-luxury-black)]">{locale === 'ar' ? "المكونات الأساسية" : "Key Ingredients"}</h4>
              <p className="whitespace-pre-line text-gray-500 font-light leading-relaxed italic">
                {ingredients || (locale === 'ar' ? "المعلومات الخاصة بالمكونات ستتوفر قريباً." : "Detailed ingredients list coming soon.")}
              </p>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-500">
              <h4 className="text-2xl font-serif mb-8 text-[var(--color-luxury-black)]">{locale === 'ar' ? "دليل الاستخدام" : "The Ritual"}</h4>
              <div className="whitespace-pre-line text-gray-500 font-light space-y-6">
                {usage ? (
                  <p className="text-lg leading-relaxed">{usage}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="flex gap-4">
                        <span className="text-4xl font-serif text-[var(--color-rose-gold)] opacity-50">01</span>
                        <p>{locale === 'ar' ? 'ابدئي ببشرة نظيفة ومرطبة تماماً.' : 'Start with a clean, perfectly hydrated canvas.'}</p>
                     </div>
                     <div className="flex gap-4">
                        <span className="text-4xl font-serif text-[var(--color-rose-gold)] opacity-50">02</span>
                        <p>{locale === 'ar' ? 'ضعي كمية صغيرة من المنتج على المنطقة المطلوبة.' : 'Apply a small amount of product to your pulse points or desired area.'}</p>
                     </div>
                     <div className="flex gap-4">
                        <span className="text-4xl font-serif text-[var(--color-rose-gold)] opacity-50">03</span>
                        <p>{locale === 'ar' ? 'ادمجي بلطف باستخدام فرشاة احترافية أو أطراف أصابعك.' : 'Blend gently using a professional brush or your fingertips for a seamless finish.'}</p>
                     </div>
                     <div className="flex gap-4">
                        <span className="text-4xl font-serif text-[var(--color-rose-gold)] opacity-50">04</span>
                        <p>{locale === 'ar' ? 'قومي بزيادة التغطية حسب الحاجة.' : 'Build layers as needed for your perfect high-definition look.'}</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-in fade-in duration-700">
              <div className="lg:col-span-8">
                <h4 className="text-2xl font-serif mb-10 text-[var(--color-luxury-black)]">What Our Customers Think</h4>
                <ReviewList productId={product.id} />
              </div>
              <div className="lg:col-span-4 sticky top-24 h-fit">
                <div className="bg-white p-8 border border-gray-100 shadow-xl rounded-[24px]">
                    <h5 className="text-sm uppercase tracking-widest font-bold mb-6">Write a Review</h5>
                    <ReviewForm productId={product.id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 pt-20 border-t border-gray-100">
        <RecommendationSection 
            title={locale === 'ar' ? 'منتجات قد تعجبكِ' : "You May Also Infuse"} 
            currentProductCategory={product.category} 
            excludeProductId={product.id}
        />
      </div>
    </div>
  );
}
