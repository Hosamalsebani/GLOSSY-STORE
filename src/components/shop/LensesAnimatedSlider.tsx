'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';

import { createClient } from '@/utils/supabase/client';

export default function LensesAnimatedSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const locale = useLocale();
  const isRtl = locale === 'ar';

  useEffect(() => {
    async function fetchSlides() {
      const supabase = createClient();
      const { data } = await supabase.from('sliders')
        .select('*')
        .eq('placement', 'lenses-slider')
        .order('sort_order', { ascending: true });
        
      if (data && data.length > 0) {
        setSlides(data);
      }
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[450px] bg-black overflow-hidden mb-12 rounded-b-[2.5rem] shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={slides[current].image_url} 
            alt={isRtl ? (slides[current].title_ar || slides[current].title) : slides[current].title}
            className="w-full h-full object-cover object-[center_30%]"
          />
          <div className={`absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent ${isRtl ? 'rotate-180' : ''}`} />
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>
      </AnimatePresence>

      <div className={`absolute inset-0 flex flex-col justify-center px-6 md:px-20 ${isRtl ? 'items-end text-right' : 'items-start text-left'} z-10`}>
        <div className="overflow-hidden mb-2">
          <motion.div
            key={`subtitle-${current}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="text-white/80 font-medium tracking-widest uppercase text-xs sm:text-sm"
          >
            {isRtl ? (slides[current].subtitle_ar || slides[current].subtitle) : slides[current].subtitle}
          </motion.div>
        </div>
        
        <div className="overflow-hidden">
          <motion.h1
            key={`title-${current}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight ${isRtl ? 'font-arabic' : 'font-serif'}`}
          >
           {isRtl ? (slides[current].title_ar || slides[current].title) : slides[current].title}
          </motion.h1>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-500 rounded-full ${
              current === index ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
