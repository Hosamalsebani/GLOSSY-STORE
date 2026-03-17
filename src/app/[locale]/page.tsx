import { getTranslations } from 'next-intl/server';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedBrands from '@/components/home/FeaturedBrands';
import TrendingProducts from '@/components/home/TrendingProducts';
import CategoryGrid from '@/components/home/CategoryGrid';
import PromoBanner from '@/components/home/PromoBanner';
import Testimonials from '@/components/home/Testimonials';
import ShopByCategory from '@/components/home/ShopByCategory';
import BeautyTipsSlider from '@/components/home/BeautyTipsSlider';
import RecommendationSection from '@/components/shop/RecommendationSection';
import { createClient } from '@/utils/supabase/server';
import { Fragment } from 'react';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const supabase = await createClient();

  // Check if we are using a placeholder URL to alert the user in logs
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
  if (isPlaceholder) {
    console.warn('CRITICAL: Using placeholder Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in Vercel.');
  }

  let categories = [];
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_en', { ascending: true });
    
    if (error) throw error;
    categories = data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }

  return (
    <div className="flex flex-col w-full">
      <HeroBanner />
      <FeaturedBrands />
      <TrendingProducts />
      <BeautyTipsSlider />
      <CategoryGrid />
      
      {categories.length > 0 ? (
        categories.map((category, index) => (
          <Fragment key={category.id}>
            <ShopByCategory 
              title={locale === 'ar' ? category.name_ar : category.name_en} 
              category={category.slug} 
              bgColor={index % 2 === 0 ? 'bg-white' : 'luxury-gradient-bg border-y border-slate-100 dark:border-white/5'} 
            />
            {/* Insert recommendation after first two categories for visual break */}
            {index === 1 && <RecommendationSection title={t('recommendationsTitle')} />}
          </Fragment>
        ))
      ) : (
        <div className="py-20 text-center bg-gray-50/50">
          <p className="text-gray-400 text-sm uppercase tracking-widest">{t('noProductsFound') || 'Stay tuned for new arrivals!'}</p>
        </div>
      )}

      <PromoBanner />
      <Testimonials />
    </div>
  );
}
