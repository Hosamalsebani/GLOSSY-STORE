'use client';

import { useAppStore } from '@/store';
import { Link } from '@/i18n/routing';
import { Trash2, ShoppingBag, ArrowRight, Share2, Check } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { decodeCart, generateShareUrl } from '@/utils/cart-share';
import { createClient } from '@/utils/supabase/client';

export default function CartPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <CartContainer />
    </Suspense>
  );
}

function CartContainer() {
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
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <ShoppingBag size={64} className="text-gray-200 mb-6" />
        <h1 className="text-3xl font-serif mb-4 text-[var(--color-luxury-black)]">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any premium beauty items to your cart yet.</p>
        <Link 
          href="/shop" 
          className="px-8 py-3 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors uppercase tracking-widest text-sm font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-20 max-w-7xl">
      <h1 className="text-4xl font-serif mb-12 text-[var(--color-luxury-black)]">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3">
          <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-200 pb-4 text-sm uppercase tracking-widest text-gray-500 font-medium mb-6">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-8">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center border-b border-gray-100 pb-8">
                {/* Product Info */}
                <div className="col-span-6 flex items-center gap-6 w-full">
                  <div className="w-24 h-32 bg-gray-50 flex-shrink-0">
                    <img 
                      src={item.image_url || (item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=400')} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[var(--color-rose-gold)] mb-1 block">{item.brand}</span>
                    <Link href={`/shop/${item.id}`} className="text-lg font-serif hover:text-[var(--color-rose-gold)] transition-colors">
                      {item.name}
                    </Link>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm mt-3"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-center w-full md:w-auto flex justify-between md:justify-center mt-4 md:mt-0">
                  <span className="md:hidden text-gray-500">Price:</span>
                  <span className="font-medium text-[var(--color-luxury-black)]">{item.price} د.ل</span>
                </div>

                {/* Quantity */}
                <div className="col-span-2 flex justify-center w-full md:w-auto">
                  <div className="flex items-center border border-gray-300">
                    <button 
                      className="px-3 py-1 hover:bg-gray-50 transition-colors"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >-</button>
                    <span className="px-4 text-sm">{item.quantity}</span>
                    <button 
                      className="px-3 py-1 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={item.quantity >= maxStock(item)}
                      onClick={() => updateQuantity(item.id, Math.min(maxStock(item), item.quantity + 1))}
                    >+</button>
                  </div>
                  {item.quantity >= maxStock(item) && maxStock(item) < 999 && (
                    <span className="text-xs text-amber-600 ml-2 self-center">Max</span>
                  )}
                </div>

                {/* Total */}
                <div className="col-span-2 text-right w-full md:w-auto flex justify-between md:justify-end mt-4 md:mt-0 font-medium text-[var(--color-luxury-black)]">
                  <span className="md:hidden text-gray-500">Total:</span>
                  {item.price * item.quantity} د.ل
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 p-8">
            <h2 className="text-xl font-serif mb-6 uppercase tracking-widest border-b border-gray-200 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{subtotal} د.ل</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-8 flex justify-between items-center text-lg">
              <span className="font-serif uppercase tracking-widest">Total</span>
              <span className="font-medium">{subtotal} د.ل</span>
            </div>

            <Link 
              href="/checkout" 
              className="w-full bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] py-4 uppercase tracking-widest text-sm font-medium transition-colors flex items-center justify-center gap-3 mb-4"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <button
              onClick={shareCart}
              disabled={isSharing}
              className={`w-full py-4 uppercase tracking-widest text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                isCopied 
                  ? 'bg-green-50 border-green-200 text-green-600' 
                  : 'bg-white border-gray-200 text-[var(--color-luxury-black)] hover:bg-gray-50'
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={16} /> Link Copied!
                </>
              ) : (
                <>
                  <Share2 size={16} /> Share This Cart
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
