'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import ProductGrid from '@/components/shop/ProductGrid';
import { Filter, ChevronRight, Home } from 'lucide-react';
import { Product, Category } from '@/types';

interface CategoryClientProps {
  initialProducts: Product[];
  category: Category;
  categories: Category[];
  locale: string;
  categorySlug: string;
  categoryName: string;
}

export default function CategoryClient({
  initialProducts,
  category,
  categories,
  locale,
  categorySlug,
  categoryName
}: CategoryClientProps) {
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    return 0; // featured (default)
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-20 mt-4">
      {/* Breadcrumbs & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-gray-100 pb-8">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--color-rose-gold)] transition-colors flex items-center gap-1">
              <Home size={14} /> {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight size={14} className={locale === 'ar' ? 'rotate-180' : ''} />
            <Link href="/shop" className="hover:text-[var(--color-rose-gold)] transition-colors">
              {locale === 'ar' ? 'المتجر' : 'Shop'}
            </Link>
            <ChevronRight size={14} className={locale === 'ar' ? 'rotate-180' : ''} />
            <span className={`text-[var(--color-luxury-black)] font-medium ${locale === 'ar' ? 'font-arabic' : 'capitalize'}`}>
              {categoryName}
            </span>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <div className="flex items-center gap-3 ml-auto md:ml-0">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{locale === 'ar' ? 'فرز حسب' : 'Sort By'}</span>
                <select 
                  aria-label="Sort products"
                  className="border-b border-gray-200 py-1 text-sm outline-none bg-transparent hover:border-[var(--color-rose-gold)] transition-colors cursor-pointer min-w-[150px]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">{locale === 'ar' ? 'المقترحة' : 'Featured'}</option>
                  <option value="price-asc">{locale === 'ar' ? 'السعر: من الأقل' : 'Price, Low to High'}</option>
                  <option value="price-desc">{locale === 'ar' ? 'السعر: من الأعلى' : 'Price, High to Low'}</option>
                  <option value="newest">{locale === 'ar' ? 'الأحدث' : 'Newest Arrivals'}</option>
                </select>
             </div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="w-full md:w-1/4 hidden md:block space-y-8 pr-4">
           <div>
             <h3 className="text-sm uppercase tracking-widest font-medium mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
               <span>{locale === 'ar' ? 'الأقسام' : 'Categories'}</span>
               <Filter size={14} />
             </h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 rounded border transition-colors ${cat.slug === categorySlug ? 'bg-[var(--color-luxury-black)] border-[var(--color-luxury-black)]' : 'border-gray-300 group-hover:border-[var(--color-luxury-black)]'}`}>
                      {cat.slug === categorySlug && (
                        <svg className="w-3 h-3 text-white m-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${cat.slug === categorySlug ? 'text-[var(--color-luxury-black)] font-medium' : 'text-gray-600 group-hover:text-[var(--color-luxury-black)]'} ${locale === 'ar' ? 'font-arabic' : ''}`}>
                       {locale === 'ar' ? cat.name_ar : cat.name_en}
                    </span>
                  </Link>
                ))}
              </div>
           </div>

           <div>
             <h3 className="text-sm uppercase tracking-widest font-medium mb-4 border-b border-gray-100 pb-2">{locale === 'ar' ? 'نطاق السعر' : 'Price Range'}</h3>
             <input type="range" aria-label="Price Range" min="0" max="500" className="w-full h-1 bg-gray-200 accent-[var(--color-luxury-black)] rounded-lg appearance-none cursor-pointer" />
             <div className="flex justify-between text-xs mt-2 text-gray-500 font-medium">
               <span>0 د.ل</span>
               <span>500+ د.ل</span>
             </div>
           </div>
           
           <button className="w-full border border-[var(--color-luxury-black)] text-[var(--color-luxury-black)] hover:bg-[var(--color-luxury-black)] hover:text-white py-3 transition-colors text-sm font-medium uppercase tracking-widest">
             {locale === 'ar' ? 'تطبيق الفلتر' : 'Apply Filters'}
           </button>
        </aside>

        {/* Product Grid */}
        <main className="w-full md:w-3/4">
          {/* Mobile Info */}
          <div className="md:hidden flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{products.length} {locale === 'ar' ? 'نتيجة' : 'Results'}</span>
          </div>

          {sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} />
          ) : (
            <div className="text-center py-20 bg-white border border-gray-100">
              <p className="text-xl font-serif text-[var(--color-luxury-black)] mb-2">{locale === 'ar' ? 'لا توجد منتجات' : 'No products found'}</p>
              <p className="text-gray-500 mb-6">{locale === 'ar' ? `لم نجد أي منتجات في قسم ${categoryName}` : `We couldn't find any products in the ${categoryName} category.`}</p>
              <Link href="/shop" className="px-6 py-3 border border-[var(--color-luxury-black)] hover:bg-[var(--color-luxury-black)] hover:text-white transition-colors uppercase tracking-widest text-sm font-medium inline-block">
                {locale === 'ar' ? 'عرض كل المنتجات' : 'View All Products'}
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
