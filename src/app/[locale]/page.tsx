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

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name_en', { ascending: true });

  return (
    <div className="flex flex-col w-full">
      <HeroBanner />
      <FeaturedBrands />
      <TrendingProducts />
      <BeautyTipsSlider />
      <CategoryGrid />
      
      {categories?.map((category, index) => (
        <Fragment key={category.id}>
          <ShopByCategory 
            title={locale === 'ar' ? category.name_ar : category.name_en} 
            category={category.slug} 
            bgColor={index % 2 === 0 ? 'bg-white' : 'luxury-gradient-bg border-y border-slate-100 dark:border-white/5'} 
          />
          {/* Insert recommendation after first two categories for visual break */}
          {index === 1 && <RecommendationSection title={t('recommendationsTitle')} />}
        </Fragment>
      ))}

      <PromoBanner />
      <Testimonials />
    </div>
  );
}
