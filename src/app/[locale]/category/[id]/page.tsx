'use client';

import { use, useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import ProductGrid from '@/components/shop/ProductGrid';
import { Filter, SlidersHorizontal, ChevronRight, Home, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';
import { useLocale } from 'next-intl';

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const categorySlug = unwrappedParams.id;
  const locale = useLocale();

  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch current category details
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();
        
        if (catData) setCategory(catData);

        // Fetch all categories for sidebar
        const { data: allCats } = await supabase
          .from('categories')
          .select('id, name_en, name_ar, slug')
          .order('name_en', { ascending: true });
        
        if (allCats) setCategories(allCats);

        // Fetch products in this category
        // Note: Using ILIKE on category string field in products table
        // In a more mature system, this would be a foreign key to categories.id
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .ilike('category', `%${categorySlug}%`);

        if (prodData) {
          setProducts(prodData);
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categorySlug, supabase]);

  const categoryName = category 
    ? (locale === 'ar' ? category.name_ar : category.name_en) 
    : categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-sm text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:text-[var(--color-luxury-black)] transition-colors flex items-center gap-1">
          <Home size={14} /> Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/shop" className="hover:text-[var(--color-luxury-black)] transition-colors">
          Shop
        </Link>
        <ChevronRight size={14} />
        <span className={`text-[var(--color-luxury-black)] font-medium ${locale === 'ar' ? 'font-arabic' : 'capitalize'}`}>
          {categoryName}
        </span>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:text-start border-b border-gray-200 pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
             <h1 className={`text-4xl md:text-5xl font-serif text-[var(--color-luxury-black)] mb-4 ${locale === 'ar' ? 'font-arabic' : 'capitalize'}`}>
               {categoryName}
             </h1>
             <p className="text-gray-500 max-w-2xl">
               Discover our luxurious collection of premium products curated for your elegant lifestyle.
             </p>
           </div>
           
           <div className="flex gap-4 w-full md:w-auto mt-6 md:mt-0">
              {/* Mobile Filter Button */}
              <button className="md:hidden flex-1 flex items-center justify-center gap-2 border border-gray-200 py-3 text-sm font-medium hover:bg-gray-100 transition-colors">
                <SlidersHorizontal size={16} /> Filters
              </button>
              
              <div className="hidden md:flex items-center gap-3">
                 <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Sort By</span>
                 <select 
                   aria-label="Sort products"
                   className="border border-gray-200 px-4 py-2 text-sm outline-none bg-transparent hover:border-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] transition-colors cursor-pointer w-48"
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                 >
                   <option value="featured">Featured</option>
                   <option value="price-asc">Price, Low to High</option>
                   <option value="price-desc">Price, High to Low</option>
                   <option value="newest">Newest Arrivals</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="w-full md:w-1/4 hidden md:block space-y-8 pr-4">
             <div>
               <h3 className="text-sm uppercase tracking-widest font-medium mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
                 <span>Categories</span>
                 <Filter size={14} />
               </h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-gray-300" />
                    </div>
                  ) : categories.map((cat) => (
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
               <h3 className="text-sm uppercase tracking-widest font-medium mb-4 border-b border-gray-100 pb-2">Price Range</h3>
               <input type="range" aria-label="Price Range" min="0" max="500" className="w-full h-1 bg-gray-200 accent-[var(--color-luxury-black)] rounded-lg appearance-none cursor-pointer" />
               <div className="flex justify-between text-xs mt-2 text-gray-500 font-medium">
                 <span>$0</span>
                 <span>$500+</span>
               </div>
             </div>
             
             <button className="w-full border border-[var(--color-luxury-black)] text-[var(--color-luxury-black)] hover:bg-[var(--color-luxury-black)] hover:text-white py-3 transition-colors text-sm font-medium uppercase tracking-widest">
               Apply Filters
             </button>
          </aside>

          {/* Product Grid */}
          <main className="w-full md:w-3/4">
            {/* Mobile Sort */}
            <div className="md:hidden flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{products.length} Results</span>
                <select 
                   aria-label="Sort products"
                   className="border border-gray-200 px-3 py-2 text-sm outline-none bg-transparent"
                 >
                   <option>Sort: Featured</option>
                   <option>Price: Low-High</option>
                </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-[var(--color-luxury-black)] border-t-transparent"></div>
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-20 bg-white border border-gray-100">
                <p className="text-xl font-serif text-[var(--color-luxury-black)] mb-2">No products found</p>
                <p className="text-gray-500 mb-6">We couldn't find any products in the {categoryName} category.</p>
                <Link href="/shop" className="px-6 py-3 border border-[var(--color-luxury-black)] hover:bg-[var(--color-luxury-black)] hover:text-white transition-colors uppercase tracking-widest text-sm font-medium inline-block">
                  View All Products
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
