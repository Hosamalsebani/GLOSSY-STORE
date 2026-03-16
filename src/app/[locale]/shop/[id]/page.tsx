'use client';

import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';
import FlashSaleTimer from '@/components/shop/FlashSaleTimer';
import StockNotificationForm from '@/components/shop/StockNotificationForm';
import RecommendationSection from '@/components/shop/RecommendationSection';
import ReviewList from '@/components/shop/ReviewList';
import ReviewForm from '@/components/shop/ReviewForm';
import { StarRating } from '@/components/shop/StarRating';
import { cn } from '@/utils/cn';

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = params.locale as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [saleExpired, setSaleExpired] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart, toggleWishlist, wishlist, trackProductView } = useAppStore();
  const supabase = createClient();

  // Combine images from different sources
  const allImages = [
    ...(product?.image_url ? [product.image_url] : []),
    ...(product?.images || []),
    ...(product?.additional_images || [])
  ].filter((img, index, self) => img && self.indexOf(img) === index);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`id.eq.${id},slug.eq.${id}`)
          .maybeSingle();
          
        if (data) {
          setProduct(data);
          setSelectedImage(data.image_url || (data.images && data.images.length > 0 ? data.images[0] : null));
          
          if (data.sale_end_date && new Date(data.sale_end_date) < new Date()) {
            setSaleExpired(true);
          }
          
          trackProductView(id);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [id, supabase]);

  useEffect(() => {
    setActiveTab('description');
  }, [locale]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded bg-slate-200 h-64 w-64"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-slate-200 rounded col-span-2"></div>
                <div className="h-4 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

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
          <div className="relative aspect-square bg-gray-50">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name} 
                className={`object-cover w-full h-full ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 uppercase tracking-widest text-xs">No Image Available</div>
            )}

            {hasDiscount && !isOutOfStock && (
              <div className="absolute top-4 left-4 z-10">
                <span className="discount-sticker min-w-[90px] justify-center">
                  <span className="relative z-10">-{discountPct}% OFF</span>
                </span>
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <span className="bg-white text-red-600 font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-md shadow-lg flex items-center gap-2">
                  <AlertTriangle size={18} /> Out of Stock
                </span>
              </div>
            )}
          </div>
          
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <div 
                  key={idx}
                  className={`w-20 h-20 bg-gray-100 border cursor-pointer flex-shrink-0 ${selectedImage === img ? 'border-[var(--color-rose-gold)]' : 'border-gray-300'}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${idx + 1}`} 
                    className={`object-cover w-full h-full transition-opacity ${selectedImage === img ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Area */}
        <div className="w-full md:w-1/2 flex flex-col pt-4">
          <span className="text-sm uppercase tracking-[0.2em] font-medium text-[var(--color-rose-gold)] mb-2 block">
            {product.brand}
          </span>
          <h1 className="text-3xl md:text-5xl font-serif mb-4 text-[var(--color-luxury-black)]">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-6">
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
              className="text-sm text-gray-500 underline hover:text-[var(--color-rose-gold)] transition-colors"
              title="View All Reviews"
            >
              View All Reviews
            </button>
          </div>

          <div className="mb-8 flex items-center gap-3 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-medium text-red-600">{finalPrice} د.ل</span>
                <span className="text-lg text-gray-400 line-through">{product.price} د.ل</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{locale === 'ar' ? 'وفر' : 'SAVE'} {discountPct}%</span>
              </>
            ) : (
              <span className="text-2xl font-medium">{product.price} د.ل</span>
            )}
          </div>

          {hasDiscount && product.sale_end_date && (
            <FlashSaleTimer 
              endDate={product.sale_end_date} 
              onExpire={() => setSaleExpired(true)} 
            />
          )}

          {!isOutOfStock && maxStock <= 5 && (
            <p className="text-sm text-amber-600 font-medium mb-4 flex items-center gap-1">
              <AlertTriangle size={14} /> Only {maxStock} left in stock!
            </p>
          )}
          
          <p className="text-gray-600 mb-8 leading-relaxed font-light">
            {locale === 'ar' ? product.description_ar : product.description}
          </p>

          <div className="flex border-t border-b border-gray-100 py-8 mb-8 gap-6">
            <div className="flex items-center border border-gray-300">
              <button 
                className="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Decrease quantity"
                aria-label="Decrease quantity"
                disabled={isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="px-6 font-medium">{quantity}</span>
              <button 
                className="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Increase quantity"
                aria-label="Increase quantity"
                disabled={isOutOfStock || quantity >= maxStock}
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
              >+</button>
            </div>
            <button 
              title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
              aria-label={isOutOfStock ? "Out of Stock" : "Add to Cart"}
              disabled={isOutOfStock}
              onClick={() => addToCart({ ...product, price: finalPrice }, quantity)}
              className={`flex-grow uppercase tracking-widest text-sm font-medium transition-colors flex items-center justify-center gap-3 ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)]'
              }`}
            >
              <ShoppingBag size={18} /> {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
            </button>
            <button 
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              onClick={() => toggleWishlist(product)}
              className={`px-6 border border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center ${isWishlisted ? "text-[var(--color-rose-gold)] border-[var(--color-rose-gold)]" : "text-gray-500"}`}
            >
              <Heart size={20} className={isWishlisted ? "fill-[var(--color-rose-gold)]" : ""} />
            </button>
          </div>

          {isOutOfStock && (
            <div className="mb-8">
              <StockNotificationForm productId={product.id} productName={product.name} />
            </div>
          )}

          <div className="space-y-4 text-sm text-gray-500 mb-12">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" />
              <span>100% Authentic Luxury Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} />
              <span>{locale === 'ar' ? 'توصيل مجاني في اليوم التالي للطلبات التي تزيد عن 150 د.ل' : 'Free Next-Day Delivery on orders over 150 د.ل'}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={18} />
              <span>30-Day Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div id="product-tabs" className="mt-24 border-t border-gray-200">
        <div className="flex gap-12 pt-8 text-sm uppercase tracking-widest font-medium border-b border-gray-100 pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('description')}
            className={cn(
              "pb-4 -mb-[18px] transition-all",
              activeTab === 'description' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {locale === 'ar' ? 'الوصف' : 'Description'}
          </button>
          <button 
            onClick={() => setActiveTab('ingredients')}
            className={cn(
              "pb-4 -mb-[18px] transition-all",
              activeTab === 'ingredients' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {locale === 'ar' ? 'المكونات' : 'Ingredients'}
          </button>
          <button 
            onClick={() => setActiveTab('usage')}
            className={cn(
              "pb-4 -mb-[18px] transition-all",
              activeTab === 'usage' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {locale === 'ar' ? 'طريقة الاستخدام' : 'How to Use'}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "pb-4 -mb-[18px] transition-all",
              activeTab === 'reviews' ? "text-[var(--color-luxury-black)] border-b-2 border-[var(--color-luxury-black)]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {locale === 'ar' ? `المراجعات (${product.review_count || 0})` : `Reviews (${product.review_count || 0})`}
          </button>
        </div>

        <div className="py-12 max-w-4xl font-light text-gray-700 leading-relaxed">
          {activeTab === 'description' && (
            <div className="max-w-3xl">
              <p className="mb-6">{locale === 'ar' ? product.description_ar : product.description}</p>
              <p>
                {locale === 'ar' 
                  ? "استمتع بتجربة الفخامة القصوى مع مجموعة GLOSSY المميزة. تم تصميم منتجاتنا بعناية فائقة باستخدام أجود المكونات لتقديم نتائج استثنائية ولمسة نهائية مثالية تدوم طوال اليوم."
                  : "Experience the ultimate luxury with GLOSSY's premium collection. Our products are carefully crafted with the finest ingredients to deliver exceptional results and a flawless finish that lasts throughout the day."
                }
              </p>
            </div>
          )}
          
          {activeTab === 'ingredients' && (
            <div className="max-w-3xl bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h4 className="text-xl font-serif mb-4 text-black">{locale === 'ar' ? "المكونات الأساسية" : "Key Ingredients"}</h4>
              <p className="whitespace-pre-line text-gray-600 italic">
                {ingredients || (locale === 'ar' ? "المعلومات الخاصة بالمكونات ستتوفر قريباً." : "Ingredients information coming soon.")}
              </p>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="max-w-3xl">
              <h4 className="text-xl font-serif mb-4 text-black">{locale === 'ar' ? "طريقة الاستخدام" : "How to Apply"}</h4>
              <div className="whitespace-pre-line">
                {usage ? (
                  <p>{usage}</p>
                ) : (
                  <ul className="space-y-4 list-disc pl-5">
                    {locale === 'ar' ? (
                      <>
                        <li>ابدئي ببشرة نظيفة ومرطبة.</li>
                        <li>ضعي كمية صغيرة من المنتج على المنطقة المطلوبة.</li>
                        <li>ادمجي بلطف باستخدام فرشاة احترافية أو أطراف أصابعك.</li>
                        <li>قومي بزيادة التغطية حسب الحاجة للحصول على مظهرك المثالي.</li>
                      </>
                    ) : (
                      <>
                        <li>Start with a clean, moisturized canvas.</li>
                        <li>Apply a small amount of product to the desired area.</li>
                        <li>Blend gently using a professional brush or your fingertips.</li>
                        <li>Build coverage as needed for your perfect look.</li>
                      </>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h4 className="text-2xl font-serif mb-8 text-black">Customer Feedback</h4>
                <ReviewList productId={product.id} />
              </div>
              <div className="lg:col-span-1">
                <ReviewForm productId={product.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      <RecommendationSection 
        title="Products You May Like" 
        currentProductCategory={product.category} 
        excludeProductId={product.id}
      />
    </div>
  );
}
