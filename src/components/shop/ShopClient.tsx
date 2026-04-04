'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/shop/ProductGrid';
import { Product } from '@/types';

interface ShopClientProps {
  initialProducts: Product[];
  brandFilter: string | null;
  locale: string;
}

export default function ShopClient({ initialProducts, brandFilter }: ShopClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Update products if initialProducts changes (e.g., when navigation happens)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-1/4">
          <h2 className="text-xl font-serif mb-6 uppercase tracking-widest border-b border-gray-200 pb-4">Filters</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-sm uppercase tracking-widest font-medium mb-4">Categories</h3>
              <ul className="space-y-3 text-gray-600">
                {['Makeup', 'Skincare', 'Perfumes', 'Accessories', 'Watches'].map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--color-rose-gold)]">
                      <input type="checkbox" className="accent-[var(--color-luxury-black)]" /> {cat}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest font-medium mb-4">Price Range</h3>
              <input 
                type="range" 
                aria-label="Price Range" 
                min="0" 
                max="500" 
                className="w-full h-1 bg-gray-200 accent-[var(--color-luxury-black)] rounded-lg appearance-none cursor-pointer" 
              />
              <div className="flex justify-between text-xs mt-2 text-gray-500 font-medium">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="w-full md:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-4 gap-4">
            <h1 className="text-3xl font-serif uppercase tracking-tight">
              {brandFilter ? `${brandFilter.replace('-', ' ')} Collection` : 'All Products'}
            </h1>
            <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{products.length} Items Found</span>
                <select aria-label="Sort products" className="border border-gray-200 px-4 py-2 text-sm outline-none bg-transparent hover:border-gray-400 focus:border-[var(--color-luxury-black)] transition-colors cursor-pointer font-medium">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
            </div>
          </div>
          
          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  );
}
