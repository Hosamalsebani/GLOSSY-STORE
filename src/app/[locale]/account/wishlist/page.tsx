'use client';

import { useAppStore } from '@/store';
import ProductGrid from '@/components/shop/ProductGrid';
import { Heart } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function WishlistPage() {
  const { wishlist } = useAppStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">My Wishlist</h1>
        <p className="text-gray-500 text-sm">Items you've saved for later.</p>
      </div>

      {wishlist.length > 0 ? (
        <ProductGrid products={wishlist} />
      ) : (
        <div className="bg-white/50 backdrop-blur-md p-12 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm rounded-[1.5rem] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-rose-gold)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-rose-gold)]/20 to-transparent rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
            <Heart size={40} className="text-[var(--color-rose-gold)]" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-3 relative z-10">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md relative z-10">
            Save your favorite beauty and skincare products here to easily find them later and build your premium collection.
          </p>
          <Link 
            href="/shop" 
            className="px-8 py-3.5 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] hover:shadow-lg hover:shadow-[var(--color-rose-gold)]/20 transition-all duration-300 rounded-full text-xs font-bold uppercase tracking-[0.2em] relative z-10 flex items-center justify-center"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
