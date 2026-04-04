import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import CategoryClient from '@/components/shop/CategoryClient';
import MotherBabyLanding from '@/components/shop/MotherBabyLanding';
import PersonalCareLanding from '@/components/shop/PersonalCareLanding';
import PerfumeHeroSection from '@/components/shop/PerfumeHeroSection';
import CategoryHero from '@/components/shop/CategoryHero';
import LensesAnimatedSlider from '@/components/shop/LensesAnimatedSlider';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id: categorySlug, locale } = await params;
  const supabase = await createClient();

  // 1. Fetch category details
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();

  if (catError || !category) {
    notFound();
  }

  // 2. Fetch all categories for sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_en, name_ar, slug')
    .order('name_en', { ascending: true });

  // 3. Fetch products for this category
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('category', `%${categorySlug}%`);

  const categoryName = locale === 'ar' ? category.name_ar : category.name_en;

  // Render Specialized Landing Pages
  if (categorySlug === 'mother-and-child') {
     const { data: articles } = await supabase
       .from('beauty_tips')
       .select('*')
       .eq('category_id', '801361cf-8784-4a26-8138-16623a679f5b');
       
     return (
       <MotherBabyLanding 
         products={products || []} 
         categoryName={categoryName} 
         articles={articles || []}
       />
     );
  }

  if (categorySlug === 'personal-care') {
    return (
      <PersonalCareLanding 
        products={products || []} 
        categoryName={categoryName} 
      />
    );
  }

  // Default Views with Page Layout
  return (
    <div className="bg-white min-h-screen">
      {categorySlug === 'lenses' ? (
        <>
          <LensesAnimatedSlider />
          <div className="bg-white border-b border-gray-100 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="flex items-center justify-center gap-4 md:gap-10 flex-wrap">
                {[
                  { name: 'Bella', logo: 'https://www.google.com/s2/favicons?domain=bellacontactlenses.com&sz=128' },
                  { name: 'Amara', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Logo_TV_2015.png' },
                  { name: 'Anesthesia', logo: 'https://www.google.com/s2/favicons?domain=anesthesialenses.com&sz=128' },
                  { name: 'FreshLook', logo: 'https://www.google.com/s2/favicons?domain=freshlookcontacts.com&sz=128' },
                  { name: 'Desio', logo: 'https://www.google.com/s2/favicons?domain=desiolens.com&sz=128' }
                ].map((brand) => (
                  <Link key={brand.name} href={`/category/lenses?brand=${brand.name.toLowerCase()}`} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border border-gray-200 p-2 group-hover:border-[var(--color-rose-gold)] transition-all flex items-center justify-center shadow-sm group-hover:shadow-md hover:-translate-y-1">
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" />
                    </div>
                    <span className="text-gray-600 text-[10px] md:text-sm font-medium group-hover:text-[var(--color-luxury-black)] transition-colors tracking-wide">{brand.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : categorySlug === 'perfumes' ? (
        <PerfumeHeroSection />
      ) : (
        <CategoryHero 
          name={categoryName}
          image={category?.image_url}
          description={locale === 'ar' ? `اكتشفي مجموعتنا الفاخرة من منتجات ${categoryName} المختارة بعناية لتناسب أسلوب حياتك الراقي.` : `Discover our luxurious collection of premium ${categoryName} products curated for your elegant lifestyle.`}
          productCount={products?.length || 0}
        />
      )}

      <CategoryClient
        initialProducts={products || []}
        category={category}
        categories={categories || []}
        locale={locale}
        categorySlug={categorySlug}
        categoryName={categoryName}
      />
    </div>
  );
}
