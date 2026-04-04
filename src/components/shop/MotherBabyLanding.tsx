'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Heart, Sparkles, Star, ChevronRight, ShieldCheck, Truck, ShoppingBag, ArrowRight, Leaf, Award } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { Product } from '@/types';
import { useState, useEffect } from 'react';

type MotherBabyLandingProps = {
  products: Product[];
  categoryName: string;
  articles?: any[];
};

export default function MotherBabyLanding({ products, categoryName, articles = [] }: MotherBabyLandingProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const stages = [
    {
      id: 'newborn', nameAr: 'مواليد', nameEn: 'Newborn',
      desc: isRtl ? '0 - 6 أشهر' : '0-6 Months',
      img: '/images/mother-baby/newborn.png',
      color: '#FADADD'
    },
    {
      id: 'infant', nameAr: 'رضع', nameEn: 'Infant',
      desc: isRtl ? '6 - 12 شهر' : '6-12 Months',
      img: '/images/mother-baby/infant.png',
      color: '#E8D5B7'
    },
    {
      id: 'toddler', nameAr: 'أطفال صغار', nameEn: 'Toddler',
      desc: isRtl ? '1 - 3 سنوات' : '1-3 Years',
      img: '/images/mother-baby/toddler.png',
      color: '#C5DCA0'
    },
  ];

  const categories = [
    {
      nameAr: 'ملابس أطفال', nameEn: 'Baby Clothing',
      descAr: 'خيوط قطنية تحاكي حنان حضنكِ؛ لتمنح طفلكِ حرية الحركة وأناقة البدايات.',
      descEn: 'Cotton threads that mimic the warmth of your embrace.',
      img: '/images/mother-baby/clothing.png',
      cta: isRtl ? 'دللي صغيركِ الآن' : 'Pamper your little one',
    },
    {
      nameAr: 'العناية بالبشرة', nameEn: 'Baby Skincare',
      descAr: 'لمسات رقيقة بمكونات طبيعية، تحمي بشرة صغيركِ الحساسة وتغمرها بالانتعاش والأمان.',
      descEn: 'Gentle touches with natural ingredients for sensitive skin.',
      img: '/images/mother-baby/hero.png',
      cta: isRtl ? 'اختاري الأفضل لملاككِ' : 'Choose the best',
    },
    {
      nameAr: 'أساسيات التغذية', nameEn: 'Feeding Essentials',
      descAr: 'أساسيات ذكية تجعل وقت الطعام لحظة ممتعة ومليئة بالصحة، بجودة تثق بها كل أم.',
      descEn: 'Smart essentials for a healthy, enjoyable mealtime.',
      img: '/images/mother-baby/infant.png',
      cta: isRtl ? 'تسوّقي بحب' : 'Shop with love',
    },
  ];

  // Map dynamic articles from DB if provided, otherwise fallback to defaults
  const displayArticles = articles.length > 0 ? articles.map(a => ({
    id: a.id,
    titleAr: a.title_ar,
    titleEn: a.title_en,
    excerptAr: a.content_ar.substring(0, 100) + '...',
    excerptEn: a.content_en.substring(0, 100) + '...',
    img: a.image_url,
    tag: isRtl ? 'نصيحة' : 'Tip'
  })) : [
    {
      titleAr: 'كيف تختارين ملابس القطن العضوي لطفلك؟',
      titleEn: 'How to Choose Organic Cotton for Baby?',
      excerptAr: 'دليل شامل لاختيار أنعم الخامات لبشرة طفلك الحساسة...',
      excerptEn: 'A comprehensive guide to the softest fabrics...',
      img: '/images/mother-baby/newborn.png',
      tag: isRtl ? 'ملابس' : 'Clothing',
    },
    {
      titleAr: 'روتين العناية ببشرة المولود الجديد',
      titleEn: 'Newborn Skincare Routine',
      excerptAr: 'خطوات بسيطة لحماية بشرة مولودك من الجفاف والتهيج...',
      excerptEn: 'Simple steps to protect your newborn\'s skin...',
      img: '/images/mother-baby/hero.png',
      tag: isRtl ? 'عناية' : 'Care',
    },
    {
      titleAr: 'أفضل 5 ألعاب تنمي ذكاء طفلك',
      titleEn: 'Top 5 Toys That Boost Baby\'s Intelligence',
      excerptAr: 'ألعاب مختارة بعناية لتحفيز النمو العقلي والبدني...',
      excerptEn: 'Carefully selected toys for mental and physical growth...',
      img: '/images/mother-baby/toddler.png',
      tag: isRtl ? 'ألعاب' : 'Toys',
    },
  ];

  const testimonials = [
    {
      nameAr: 'هدى م.', nameEn: 'Huda M.',
      textAr: 'أخيراً لقيت متجر يفهم احتياجاتي كأم! الجودة ممتازة والتوصيل سريع جداً. شكراً GLOSSY ❤️',
      textEn: 'Finally found a store that understands my needs as a mom! Excellent quality and very fast delivery.',
      rating: 5,
    },
    {
      nameAr: 'فاطمة ع.', nameEn: 'Fatima A.',
      textAr: 'طلبت مجموعة العناية لبشرة بنتي وفعلاً الفرق واضح. منتجات طبيعية وآمنة 100%.',
      textEn: 'Ordered the skincare set for my daughter and the difference is clear. 100% natural and safe.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION — Full-width gradient with emotional copy     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{
        background: 'linear-gradient(135deg, #FFF5EE 0%, #FFECD2 30%, #FCB69F 60%, #FF9A9E 100%)'
      }}>
        {/* Decorative floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
          <div className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] right-[30%] w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FFB6C1 0%, transparent 70%)' }} />
          {/* Small hearts floating */}
          {mounted && (
            <>
              <Heart className="absolute top-[15%] right-[15%] text-white/20 animate-pulse" size={24} />
              <Heart className="absolute top-[25%] left-[20%] text-white/15 animate-pulse" size={16} style={{ animationDelay: '1s' }} />
              <Heart className="absolute bottom-[30%] right-[25%] text-white/20 animate-pulse" size={20} style={{ animationDelay: '0.5s' }} />
              <Sparkles className="absolute top-[20%] right-[40%] text-white/25 animate-pulse" size={18} style={{ animationDelay: '1.5s' }} />
            </>
          )}
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`space-y-6 ${isRtl ? 'order-1' : 'order-1 md:order-1'}`}>
              <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="text-[#c2185b]" size={16} />
                <span className="text-sm font-bold text-[#880e4f] tracking-wide">
                  {isRtl ? 'رفيقكِ في رحلة الأمومة' : 'Your Motherhood Companion'}
                </span>
              </div>

              <h1 className="text-4xl md:text-[3.5rem] leading-[1.15] font-extrabold text-[#3e2723]" style={{ fontFamily: isRtl ? 'inherit' : 'Georgia, serif' }}>
                {isRtl
                  ? <>لأن عالمكِ يبدأ <br /><span className="text-[#c2185b]">بابتسامته</span>.. <br />نعتني بكل تفاصيل حبكِ</>
                  : <>Because your world <br />starts with <span className="text-[#c2185b]">their smile</span></>
                }
              </h1>

              <p className="text-lg text-[#5d4037] leading-relaxed max-w-md opacity-90">
                {isRtl
                  ? 'من القلب إلى المهد.. مختاراتنا صُنعت لتكبر مع ذكرياتكما الجميلة. جودة تليق بنعومة ملاككِ الصغير.'
                  : 'From the heart to the cradle.. our selections are made to grow with your beautiful memories.'}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="#top-picks"
                  className="inline-flex items-center gap-3 bg-[#c2185b] text-white px-8 py-4 rounded-full font-bold text-base shadow-xl hover:shadow-2xl hover:bg-[#ad1457] transition-all duration-300 transform hover:-translate-y-1"
                >
                  {isRtl ? 'اكتشفي التشكيلة' : 'Explore Collection'}
                  <ArrowRight size={18} className={isRtl ? 'rotate-180' : ''} />
                </Link>
                <Link
                  href="#promises"
                  className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm text-[#880e4f] px-6 py-4 rounded-full font-bold text-base hover:bg-white/60 transition-all duration-300"
                >
                  {isRtl ? 'لماذا نحن؟' : 'Why Us?'}
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className={`relative ${isRtl ? 'order-2' : 'order-2'}`}>
              <div className="relative w-full aspect-[4/5] max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50" style={{ transform: 'rotate(-3deg)' }}>
                  <img
                    src="/images/mother-baby/hero.png"
                    alt={isRtl ? 'أم وطفلها' : 'Mother and Baby'}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 md:left-4 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3 z-10">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <Leaf className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{isRtl ? 'مكونات طبيعية' : 'Natural Ingredients'}</p>
                    <p className="text-[10px] text-gray-500">{isRtl ? 'آمنة 100%' : '100% Safe'}</p>
                  </div>
                </div>
                {/* Another floating badge */}
                <div className="absolute -top-2 -right-2 md:right-4 bg-white rounded-2xl p-3 shadow-xl z-10">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{isRtl ? '+2000 أم سعيدة' : '2000+ Happy Moms'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. SHOP BY AGE — Beautiful circular cards with real images     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-[#c2185b] bg-pink-50 px-4 py-2 rounded-full mb-4">
              {isRtl ? 'التسوق حسب المرحلة' : 'Shop by Stage'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              {isRtl ? 'اختاري حسب عمر طفلكِ' : 'Choose by Your Baby\'s Age'}
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            {stages.map((stage, idx) => (
              <Link
                key={stage.id}
                href={`/category/mother-and-child`}
                className="flex flex-col items-center group"
              >
                <div
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500 relative"
                  style={{ borderColor: stage.color }}
                >
                  <img
                    src={stage.img}
                    alt={isRtl ? stage.nameAr : stage.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900 group-hover:text-[#c2185b] transition-colors">
                  {isRtl ? stage.nameAr : stage.nameEn}
                </h3>
                <p className="text-sm text-gray-400">{stage.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. CATEGORY SHOWCASE — Large editorial cards                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #FFF9F5 0%, #FFFFFF 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-[#c2185b] bg-pink-50 px-4 py-2 rounded-full mb-4">
              {isRtl ? 'أقسامنا المميزة' : 'Featured Categories'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              {isRtl ? 'كل ما يحتاجه صغيركِ في مكان واحد' : 'Everything Your Baby Needs'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={cat.img}
                    alt={isRtl ? cat.nameAr : cat.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">{isRtl ? cat.nameAr : cat.nameEn}</h3>
                    <p className="text-white/80 text-sm mb-5 line-clamp-2">{isRtl ? cat.descAr : cat.descEn}</p>
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/30 transition-colors">
                      {cat.cta}
                      <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. TOP PICKS — Products Grid                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="top-picks" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className={`flex justify-between items-end mb-12 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div>
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-[#c2185b] bg-pink-50 px-4 py-2 rounded-full mb-4">
                {isRtl ? 'الأكثر مبيعاً' : 'Best Sellers'}
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {isRtl ? 'مختاراتنا لكِ ولطفلكِ' : 'Our Picks for Mom & Baby'}
              </h2>
              <p className="text-gray-400 mt-2">{isRtl ? 'مختاراتنا صُنعت لتكبر مع ذكرياتكما الجميلة' : 'Curated to grow with your beautiful memories'}</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-[#c2185b] font-bold hover:underline">
              {isRtl ? 'عرض الكل' : 'View All'}
              <ChevronRight size={18} className={isRtl ? 'rotate-180' : ''} />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.slice(0, 8).map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-pink-50/50 rounded-3xl">
              <ShoppingBag className="mx-auto mb-4 text-pink-300" size={48} />
              <p className="text-gray-600 font-bold">{isRtl ? 'المنتجات قادمة قريباً!' : 'Products coming soon!'}</p>
              <p className="text-gray-400 text-sm mt-2">{isRtl ? 'نحضّر لكِ أفضل المنتجات' : 'We\'re preparing the best products for you'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5. EXPERT BLOG — Editorial cards                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #FFF5EE 0%, #FFF9F5 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-[#c2185b] bg-pink-50 px-4 py-2 rounded-full mb-4">
              {isRtl ? 'نصيحة الخبراء' : 'Expert Advice'}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {isRtl ? 'مقالات تساعدكِ في رحلة الأمومة' : 'Articles to Help Your Journey'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayArticles.map((article, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer group">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={article.img}
                    alt={isRtl ? article.titleAr : article.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#c2185b] uppercase tracking-wider">{article.tag}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-[#c2185b] transition-colors">{isRtl ? article.titleAr : article.titleEn}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{isRtl ? article.excerptAr : article.excerptEn}</p>
                  <div className="mt-4">
                    <Link href={`/tips/${(article as any).id || idx}`} className="inline-flex items-center gap-1 text-[#c2185b] text-sm font-bold">
                      {isRtl ? 'اقرئي المزيد' : 'Read More'}
                      <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 6. MOM'S STORIES — Testimonials                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-[#c2185b] bg-pink-50 px-4 py-2 rounded-full mb-4">
              {isRtl ? 'قصص الأمهات' : "Mom's Stories"}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {isRtl ? 'ماذا تقول أمهاتنا؟' : 'What Our Moms Say'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, idx) => (
              <div key={idx} className="relative bg-gradient-to-br from-pink-50 to-orange-50 p-8 rounded-3xl">
                <div className="absolute top-6 right-6 opacity-10">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#c2185b"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-base leading-relaxed mb-6 italic">
                  &ldquo;{isRtl ? t.textAr : t.textEn}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white font-bold text-lg">
                    {(isRtl ? t.nameAr : t.nameEn).charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{isRtl ? t.nameAr : t.nameEn}</p>
                    <p className="text-gray-400 text-xs">{isRtl ? 'أم سعيدة ❤️' : 'Happy Mom ❤️'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 7. OUR PROMISES — Trust signals                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="promises" className="py-20" style={{ background: 'linear-gradient(135deg, #FFF5EE 0%, #FCE4EC 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {isRtl ? 'وعودنا لكِ' : 'Our Promises to You'}
            </h2>
            <p className="text-gray-500 mt-3">{isRtl ? 'نحن لا نبيع منتجات بل نختار بعناية ما نرضاه لأطفالنا' : 'We don\'t sell products, we carefully choose what we accept for our children'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl text-center shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <ShieldCheck size={36} className="text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{isRtl ? 'خامات آمنة 100%' : '100% Safe Materials'}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isRtl ? 'راحة بالكِ هي أولويتنا؛ جميع خاماتنا مختبرة طبيًا، خالية من الكيماويات، ولطيفة تمامًا على بشرة طفلكِ.' : 'Your peace of mind is our priority. All materials are medically tested and chemical-free.'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl text-center shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                <Award size={36} className="text-[#c2185b]" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{isRtl ? 'الجودة العالية' : 'Premium Quality'}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isRtl ? 'نحن لا نبيع منتجات، بل نختار بعناية ما نرضاه لأطفالنا؛ معاييرنا في الجودة لا تقبل المساومة.' : 'We carefully choose what we accept for our own children; our quality standards are uncompromising.'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl text-center shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
                <Truck size={36} className="text-blue-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{isRtl ? 'توصيل سريع' : 'Fast Delivery'}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isRtl ? 'نعلم أن وقتكِ ثمين.. لذا نحن نسابق الزمن لنصل إلى باب بيتكِ قبل أن يحتاج طفلكِ لغرضه القادم.' : 'We know your time is precious, so we race to reach your door before your baby needs their next item.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 8. FINAL CTA — Emotional call to action                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #c2185b 0%, #e91e63 50%, #f06292 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute bottom-[10%] right-[15%] w-80 h-80 rounded-full bg-white/5" />
          {mounted && (
            <>
              <Heart className="absolute top-[15%] right-[20%] text-white/10 animate-pulse" size={48} />
              <Heart className="absolute bottom-[20%] left-[15%] text-white/10 animate-pulse" size={32} style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            {isRtl ? 'دللي صغيركِ الآن مع GLOSSY' : 'Pamper Your Little One with GLOSSY'}
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            {isRtl ? 'امنحيه الراحة التي يستحقها.. تسوّقي الآن واستمتعي بتوصيل سريع وآمن' : 'Give them the comfort they deserve.. Shop now with fast & safe delivery'}
          </p>
          <Link href="/shop" className="inline-flex items-center gap-3 bg-white text-[#c2185b] px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-300">
            <ShoppingBag size={22} />
            {isRtl ? 'تسوّقي بحب' : 'Shop with Love'}
          </Link>
        </div>
      </section>

      <div className="h-20 lg:h-0" />
    </div>
  );
}
