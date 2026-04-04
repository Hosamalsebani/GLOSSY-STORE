'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  Filter, 
  Plus, 
  Droplets, 
  Sparkles, 
  Leaf, 
  ShieldCheck, 
  Heart, 
  Wind, 
  ChevronRight, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import styles from './PersonalCare.module.css';
import ProductCard from '@/components/ui/ProductCard';

import { Product } from '@/types';

type PersonalCareLandingProps = {
  products: Product[];
  categoryName: string;
};

export default function PersonalCareLanding({ products, categoryName }: PersonalCareLandingProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [activeFilter, setActiveFilter] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filters = [
    { id: 'all', en: 'All Essentials', ar: 'كل الأساسيات' },
    { id: 'cleanse', en: 'Cleanse', ar: 'تنظيف', icon: <Droplets size={14} /> },
    { id: 'treat', en: 'Treat', ar: 'علاج', icon: <Sparkles size={14} /> },
    { id: 'hydrate', en: 'Hydrate', ar: 'ترطيب', icon: <Wind size={14} /> },
    { id: 'sensitive', en: 'Sensitive Skin', ar: 'بشرة حساسة', icon: <Heart size={14} /> },
    { id: 'oily', en: 'Oily Skin', ar: 'بشرة دهنية' },
    { id: 'dry', en: 'Dry Skin', ar: 'بشرة جافة' },
  ];

  const routineSteps = [
    {
      num: '01',
      titleEn: 'Cleanse',
      titleAr: 'التنظيف',
      descEn: 'Gently remove impurities while preserving the skin barrier.',
      descAr: 'إزالة الشوائب بلطف مع الحفاظ على حاجز البشرة الطبيعي.',
      icon: <Droplets className={styles.routineIcon} size={32} />
    },
    {
      num: '02',
      titleEn: 'Treat',
      titleAr: 'العلاج',
      descEn: 'Targeted serums for your specific skin concerns.',
      descAr: 'سيرومات مركزة تستهدف مشاكل بشرتكِ المحددة.',
      icon: <Maximize2 className={styles.routineIcon} size={32} />
    },
    {
      num: '03',
      titleEn: 'Hydrate',
      titleAr: 'الترطيب',
      descEn: 'Lock in moisture for a dewy, healthy glow.',
      descAr: 'حبس الرطوبة للحصول على إشراقة ندية وصحية.',
      icon: <Wind className={styles.routineIcon} size={32} />
    }
  ];

  // Demo products if none provided
  const displayProducts = products.length > 0 ? products : [
    {
      id: 'demo-1',
      name: 'Hydrating Mist Toner',
      name_ar: 'تونر الرذاذ المرطب',
      price: 120,
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      brand: 'Botanical'
    },
    {
      id: 'demo-2',
      name: 'Pure Squalane Oil',
      name_ar: 'زيت السكوالين النقي',
      price: 185,
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
      brand: 'Skin Intellect'
    },
    {
      id: 'demo-3',
      name: 'Ceramide Barrier Cream',
      name_ar: 'كريم السيراميد الواقي',
      price: 155,
      image_url: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800',
      brand: 'Ritual'
    }
  ];

  return (
    <div className={`${styles.container} ${isRtl ? styles.arabic : ''}`}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img 
            src="/images/category_personal_care.png" 
            alt="Personal Care" 
            className={styles.heroImage} 
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <span className="inline-block px-4 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] font-bold uppercase tracking-[0.3em] mb-6 animate-pulse">
            {isRtl ? 'ملاذكِ اليومي' : 'Your Daily Sanctuary'}
          </span>
          <h1 className={styles.heroHeadline}>
            {isRtl ? 'أنتِ أغلى استثماراتكِ.. امنحي ذاتكِ الرعاية التي تليق بتفردكِ.' : 'The Sanctuary of Self-Care'}
          </h1>
          <p className={styles.heroSubline}>
            {isRtl 
              ? 'لأن العناية ليست مجرد روتين، بل هي لغة حب يومية تتحدثين بها إلى نفسكِ، نقدم لكِ خلاصة العلم لتعزيز جمالكِ الطبيعي.'
              : 'True radiance begins with a dedicated ritual. Discover scientifically-proven formulas designed for your unique skin identity.'}
          </p>
        </div>
      </section>

      {/* 2. SMART FILTERING BAR */}
      <div className={styles.filterSection}>
        <div className="container mx-auto px-4">
            <div className={`flex items-center gap-4 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Filter className="text-[#4A5D4E]/40" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {isRtl ? 'تصفية حسب' : 'Quick Filter'}
                </span>
            </div>
            <div className={`${styles.filterScroll} ${isRtl ? 'flex-row-reverse' : ''}`}>
                {filters.map((f) => (
                    <button 
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`${styles.filterPill} ${activeFilter === f.id ? styles.filterPillActive : ''}`}
                    >
                        {f.icon}
                        {isRtl ? f.ar : f.en}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 3. CATEGORY INTROS */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="text-center md:text-right group">
                      <h3 className="text-xl font-serif text-[#4A5D4E] mb-4 group-hover:text-[#D4AF37] transition-colors">
                          {isRtl ? 'هندسة الجمال (Skin Intellect)' : 'Skin Intellect'}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed font-light">
                          {isRtl 
                            ? 'اكتشفي تركيباتنا المتطورة التي تدمج بين الابتكار العلمي والمستخلصات النقية.' 
                            : 'Engineered beauty combining scientific innovation with pure botanical extracts.'}
                      </p>
                  </div>
                  <div className="text-center group border-x border-gray-100 px-6">
                      <h3 className="text-xl font-serif text-[#4A5D4E] mb-4 group-hover:text-[#D4AF37] transition-colors">
                          {isRtl ? 'ملاذ الجسم (Body Sanctuary)' : 'Body Sanctuary'}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed font-light">
                          {isRtl 
                            ? 'استمتعي بقوام مخملي وروائح تأسر الحواس، صُممت لتنقية بشرة الجسم وترطيبها.' 
                            : 'Velvety textures and scents designed to purify and deeply hydrate your body.'}
                      </p>
                  </div>
                  <div className="text-center md:text-left group">
                      <h3 className="text-xl font-serif text-[#4A5D4E] mb-4 group-hover:text-[#D4AF37] transition-colors">
                          {isRtl ? 'طقوس الاسترخاء (Ritual Tools)' : 'Ritual Tools'}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed font-light">
                          {isRtl 
                            ? 'من أحجار التدليك الطبيعية إلى الملحقات التي تعزز امتصاص منتجاتكِ الفاخرة.' 
                            : 'From natural massage stones to tools that enhance your luxury skincare absorption.'}
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* 4. PRODUCT GRID */}
      <section className="py-10">
        <div className={styles.sectionHeader}>
            <div className={styles.sectionLine}></div>
            <h2 className={styles.sectionTitle}>{isRtl ? 'إصداراتنا المختارة' : 'Our Selection'}</h2>
        </div>
        <div className={styles.productGrid}>
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product as any} index={index} />
          ))}
        </div>
      </section>

      {/* 5. EDUCATIONAL MODULE: THE ROUTINE GUIDE */}
      <section className={styles.routineSection}>
          <div className="container mx-auto">
              <div className="px-6 mb-10 text-center md:text-right">
                  <h2 className={styles.sectionTitle}>{isRtl ? 'دليل الروتين' : 'The Routine Guide'}</h2>
                  <p className="text-gray-400 text-sm">{isRtl ? 'خطوات بسيطة لنتائج استثنائية' : 'Simple steps for exceptional results'}</p>
              </div>
              <div className={styles.routineCards}>
                  {routineSteps.map((step) => (
                      <div key={step.num} className={styles.routineCard}>
                          <div className={styles.routineNumber}>{step.num}</div>
                          {step.icon}
                          <h3 className={styles.routineTitle}>{isRtl ? step.titleAr : step.titleEn}</h3>
                          <p className="text-sm text-gray-500 font-light leading-relaxed">
                              {isRtl ? step.descAr : step.descEn}
                          </p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 6. TRUST SIGNALS */}
      <section className={styles.trustSection}>
          <div className={styles.trustItem}>
              <ShieldCheck className="text-[#4A5D4E]" size={36} strokeWidth={1} />
              <span className={styles.trustText}>{isRtl ? 'مختبر جلدياً' : 'Dermatologically Tested'}</span>
          </div>
          <div className={styles.trustItem}>
              <Heart className="text-[#4A5D4E]" size={36} strokeWidth={1} />
              <span className={styles.trustText}>{isRtl ? 'خالٍ من القسوة' : 'Cruelty-Free'}</span>
          </div>
          <div className={styles.trustItem}>
              <Leaf className="text-[#4A5D4E]" size={36} strokeWidth={1} />
              <span className={styles.trustText}>{isRtl ? 'مكونات عضوية' : 'Organic Ingredients'}</span>
          </div>
      </section>

      {/* 7. THE PROMISE / CTA */}
      <section className="py-32 bg-[#4A5D4E] text-[#FAF9F6] relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
              <h2 className="text-4xl font-serif mb-8">{isRtl ? 'التقاء الطبيعة بالنتائج الملموسة' : 'Nature Meets Results'}</h2>
              <p className="text-lg font-light leading-relaxed mb-12 opacity-90">
                  {isRtl 
                    ? 'نحن نؤمن بأن الثقة تبدأ من الشفافية؛ لذا اخترنا لكِ أنقى المكونات العضوية التي أثبتت كفاءتها مختبرياً. منتجاتنا خالية من الوعود الزائفة، فهي تعمل بذكاء مع كيمياء جسمكِ لتحقيق نتائج ملحوظة.'
                    : 'We believe confidence starts with transparency. Our laboratory-proven organic formulas work with your bodys chemistry for visible, lasting results.'}
              </p>
              <button className="px-12 py-5 bg-[#FAF9F6] text-[#4A5D4E] rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#D4AF37] hover:text-white transition-all shadow-xl hover:-translate-y-1">
                  {isRtl ? 'ابدئي طقوسكِ الخاصة' : 'Start Your Ritual'}
              </button>
          </div>
          <div className="absolute top-0 right-0 opacity-10 blur-3xl w-96 h-96 bg-[#D4AF37] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </section>

      {/* FOOTER CTA */}
      <div className="py-10 text-center bg-white border-t border-gray-50">
          <p className="text-[10px] text-gray-300 font-bold tracking-[0.5em] uppercase mb-4">Quality Guaranteed</p>
          <div className="flex items-center justify-center gap-10 opacity-30 grayscale contrast-125">
              <span className="text-sm font-serif">AESTURA</span>
              <span className="text-sm font-serif">ROUND LAB</span>
              <span className="text-sm font-serif">ANUA</span>
              <span className="text-sm font-serif">BEAUTY OF JOSEON</span>
          </div>
      </div>
    </div>
  );
}
