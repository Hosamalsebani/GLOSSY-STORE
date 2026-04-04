import { Fragment, Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import TrendingProducts from '@/components/home/TrendingProducts';
import ShopByCategory from '@/components/home/ShopByCategory';
import NewArrivals from '@/components/home/NewArrivals';
import BrandShowcase from '@/components/home/BrandShowcase';
import WeekendOffers from '@/components/home/WeekendOffers';
import FlashSaleBar from '@/components/ui/FlashSaleBar';
import LensesBanner from '@/components/home/LensesBanner';
import MysteryBoxPromo from '@/components/home/MysteryBoxPromo';
import PerfumeBanner from '@/components/home/PerfumeBanner';
import StickyPaymentBar from '@/components/layout/StickyPaymentBar';
import { createClient } from '@/utils/supabase/server';

type PromoSquare = {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  labelAr: string;
  labelEn: string;
};

const DEFAULT_SQUARES: PromoSquare[] = [
  {
    image: '/images/mother_baby_custom.png',
    title: 'Mother & Baby',
    subtitle: '',
    link: '/category/mother-and-child',
    labelAr: 'الأم والطفل',
    labelEn: 'Mother & Baby',
  },
  {
    image: '/images/personal_care_custom.png',
    title: 'Personal Care',
    subtitle: '',
    link: '/category/personal-care',
    labelAr: 'العناية الشخصية',
    labelEn: 'Personal Care',
  },
];

// Lightweight loading placeholder for streamed sections
function SectionSkeleton() {
  return <div className="w-full h-48 animate-pulse bg-gray-50 rounded-lg" />;
}

// Lightweight loading placeholder for the entire home payload
function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="w-full h-[400px] bg-gray-100 rounded-2xl" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map(i => <div key={i} className="w-24 h-24 bg-gray-100 rounded-full shrink-0" />)}
      </div>
      <div className="w-full h-64 bg-gray-100 rounded-xl mt-8" />
    </div>
  );
}

async function HomePayload({ locale }: { locale: string }) {
  const supabase = await createClient();
  const isAr = locale === 'ar';

  // Fetch both queries in parallel — cuts load time in half
  const [slidersResult, categoriesResult] = await Promise.all([
    supabase
      .from('sliders')
      .select('*')
      .eq('placement', 'home')
      .order('sort_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .in('slug', ['makeup', 'perfumes', 'skincare', 'hair-care']),
  ]);

  const slidersData = slidersResult.data || [];
  const order = ['makeup', 'perfumes', 'skincare', 'hair-care'];
  const categories = categoriesResult.data?.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)) || [];

  const initialSlides = slidersData.map((s: any) => ({
    id: s.id,
    image: s.image_url,
    title: locale === 'ar' ? (s.title_ar || s.title) : s.title,
    subtitle: locale === 'ar' ? (s.subtitle_ar || s.subtitle || '') : (s.subtitle || ''),
    link: s.link || '/shop'
  }));

  return (
    <>
      {/* SEO H1 - Visually styled but still the page's main heading */}
      <h1 className="sr-only">
        {isAr
          ? 'جلوسي - متجر مستحضرات التجميل والعناية بالبشرة الفاخرة في ليبيا'
          : 'Glossy - Premium Beauty & Skincare Store in Libya'}
      </h1>

      {/* 1. Hero Sliders - Full Bleed */}
      <HeroBanner initialSlides={initialSlides} locale={locale} />

      {/* 2. Quick Categories (Bubbles) */}
      <CategoryGrid />

      {/* 3. High Impact Section: Best Sellers */}
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingProducts />
      </Suspense>
      
      {/* 4. Luxury Lenses Showcase - Featured Category */}
      <LensesBanner />

      {/* Mystery Box - Premium Design */}
      <MysteryBoxPromo />

      {/* Luxury Perfume Section - Auto-scroll brands + Dynamic Banner */}
      <PerfumeBanner />

      {/* Dynamic Promo Squares */}
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex gap-2 mx-auto justify-center">
          {DEFAULT_SQUARES.map((sq, i) => (
            <Link key={i} href={sq.link as any} className="relative flex-1 max-w-[250px] aspect-[4/3] rounded-2xl overflow-hidden group shadow-sm border border-gray-100">
               <Image
                 src={sq.image}
                 alt={isAr ? sq.labelAr : sq.labelEn}
                 fill
                 sizes="(max-width: 640px) 50vw, 250px"
                 className="object-cover transition-transform duration-700 md:group-hover:scale-110"
                 loading="lazy"
               />
               <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500" />
            </Link>
          ))}
        </div>
      </div>

      {categories.length > 0 && categories.map((category: any, index: number) => (
        <Fragment key={category.id}>
          <Suspense fallback={<SectionSkeleton />}>
            <ShopByCategory 
              title={locale === 'ar' ? category.name_ar : category.name_en} 
              category={category.slug} 
              bgColor={index % 2 === 0 ? 'bg-white' : 'bg-[#fff]'} 
            />
          </Suspense>
        </Fragment>
      ))}

      {/* New Arrivals */}
      <div className="py-2 bg-white border-t border-gray-50">
        <Suspense fallback={<SectionSkeleton />}>
          <NewArrivals />
        </Suspense>
      </div>

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Gold Bar (Flash Sale) */}
      <FlashSaleBar />

      {/* Weekend Offers */}
      <Suspense fallback={<SectionSkeleton />}>
        <WeekendOffers />
      </Suspense>

      {/* SEO Content Section - Arabic Rich Text for Google */}
      <section className="bg-[#fdf8f8] border-t border-gray-100">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            {isAr ? 'مرحباً بكِ في جلوسي' : 'Welcome to Glossy'}
          </h2>
          {isAr ? (
            <div className="text-sm leading-7 text-gray-600 space-y-3 text-right">
              <p>
                <strong>جلوسي</strong> هو وجهتكِ المثالية لمستحضرات التجميل والعناية بالبشرة الفاخرة في ليبيا. نقدم لكِ مجموعة واسعة ومتنوعة من أفضل الماركات العالمية في عالم الجمال، بدءاً من المكياج الاحترافي ومروراً بالعطور الفاخرة ومنتجات العناية بالبشرة والشعر، وصولاً إلى مستحضرات العناية الشخصية ومنتجات الأم والطفل.
              </p>
              <p>
                نحرص في جلوسي على انتقاء المنتجات الأصلية 100% من أشهر العلامات التجارية العالمية مثل MAC، وشارلوت تيلبوري، وهدى بيوتي، ومايبيلين، وغيرها الكثير. هدفنا هو أن نوفر لكِ تجربة تسوق فاخرة ومريحة من منزلك مع ضمان أعلى معايير الجودة والأمان.
              </p>
              <p>
                نوفر خدمة <strong>الشحن السريع</strong> لجميع مدن ليبيا، بما في ذلك طرابلس وبنغازي ومصراتة والزاوية وسبها وغيرها. كما نقدم <strong>عروض حصرية</strong> وخصومات يومية تصل إلى 60% على منتجات مختارة، بالإضافة إلى صناديق المفاجآت الشهرية التي تمنحكِ منتجات فاخرة بأسعار مذهلة.
              </p>
              <p>
                سواء كنتِ تبحثين عن أحمر شفاه مثالي، أو كريم مرطب للبشرة، أو عطر فاخر يدوم طويلاً، ستجدين في جلوسي كل ما تحتاجينه لإطلالة مثالية. انضمي إلى آلاف العملاء السعداء واستمتعي بتجربة تسوق لا مثيل لها!
              </p>
            </div>
          ) : (
            <div className="text-sm leading-7 text-gray-600 space-y-3">
              <p>
                <strong>Glossy</strong> is your premier destination for luxury beauty and skincare in Libya. We offer an extensive collection of world-renowned brands spanning professional makeup, luxury perfumes, skincare essentials, hair care, and personal care products.
              </p>
              <p>
                We provide <strong>fast shipping</strong> to all cities across Libya, exclusive daily deals up to 60% off, and monthly mystery boxes. Join thousands of happy customers and discover your perfect beauty routine with Glossy.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Buffer for bottom nav */}
      <div className="h-20 lg:h-0" />

      {/* Sticky Trust Bar */}
      <StickyPaymentBar />
    </>
  );
}

export default async function Home() {
  const locale = await getLocale();

  return (
    <div className="flex flex-col gap-0 bg-white">
      <Suspense fallback={<HomeSkeleton />}>
        <HomePayload locale={locale} />
      </Suspense>
    </div>
  );
}
