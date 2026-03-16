'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { Sparkles } from 'lucide-react';

type Slide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
};

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const t = useTranslations('HomePage');
  const supabase = createClient();
  const locale = useLocale();

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('sliders')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (!error && data) {
        setSlides(data.map(s => ({
          id: s.id,
          image: s.image_url,
          title: locale === 'ar' ? (s.title_ar || s.title) : s.title,
          subtitle: locale === 'ar' ? (s.subtitle_ar || s.subtitle || '') : (s.subtitle || '')
        })));
      }
    };
    
    fetchSlides();
  }, [locale]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Decorative luxury elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Sparkles className="absolute top-[15%] left-[10%] text-[var(--color-gold-luxury)] opacity-40 w-5 h-5 md:w-8 md:h-8 animate-pulse" />
        <Sparkles className="absolute top-[10%] right-[15%] text-[var(--color-rose-gold)] opacity-35 w-4 h-4 md:w-6 md:h-6 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--color-blush-pink)] opacity-10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--color-gold-luxury)] opacity-5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center min-h-[420px] md:min-h-[600px] py-8 md:py-0"
          >
            {/* Text Content - full width on mobile, above image */}
            <div className="w-full md:w-1/2 flex flex-col justify-center z-10 text-center md:text-left order-1 md:order-1">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold mb-3 block gold-gradient-text">
                  {t('welcome')}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-4 md:mb-6 leading-tight text-[var(--color-luxury-black)]">
                  {slides[current]?.title}
                </h1>
                <p className="text-sm md:text-base font-light mb-8 text-slate-500 max-w-sm mx-auto md:mx-0">
                  {slides[current]?.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <Link 
                    href="/shop" 
                    className="group relative inline-block px-10 py-4 bg-slate-900 text-white font-bold tracking-widest uppercase text-xs rounded-full overflow-hidden transition-all duration-300 shadow-xl hover:shadow-gold-luxury/20 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gold-luxury-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-slate-900">{t('shopNow')}</span>
                  </Link>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-full border border-slate-100 dark:border-white/5 bg-white/50 backdrop-blur-sm">
                    <div className="size-2 rounded-full bg-gold-luxury animate-ping" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('limitedOffer')}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Product Image - below text on mobile */}
            <div className="w-full md:w-1/2 flex items-center justify-center relative order-2 mt-6 md:mt-0">
              <motion.img 
                src={slides[current]?.image || ''}
                alt={slides[current]?.title || 'Hero'}
                className="max-h-[250px] md:max-h-[500px] w-auto object-contain drop-shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                index === current 
                  ? 'w-8 h-2.5 bg-[var(--color-rose-gold)]' 
                  : 'w-2.5 h-2.5 bg-[var(--color-rose-gold)]/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
