'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

// Static testimonials moved to translation files

export default function Testimonials() {
  const locale = useLocale();
  const t = useTranslations('Testimonials');
  const isRtl = locale === 'ar';

  const testimonials = [
    { id: 1, name: t('t1_name'), text: t('t1_text'), rating: 5 },
    { id: 2, name: t('t2_name'), text: t('t2_text'), rating: 5 },
    { id: 3, name: t('t3_name'), text: t('t3_text'), rating: 5 },
  ];

  return (
    <section className="py-10 md:py-24 bg-[var(--color-soft-beige)] pb-24 md:pb-24">
      <div className="px-4 md:container md:mx-auto md:px-8">
        
        <div className="text-center mb-8 md:mb-14">
          <h2 className={`text-2xl md:text-4xl font-serif text-[var(--color-luxury-black)] ${isRtl ? 'font-arabic' : ''}`}>
            <span className="border-b-2 border-[var(--color-rose-gold)] pb-1">{t('title')}</span>
          </h2>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:max-w-6xl md:mx-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="min-w-[260px] md:min-w-0 snap-start bg-white p-6 md:p-10 rounded-2xl border border-gray-100 flex flex-col items-center text-center relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[var(--color-rose-gold)] flex items-center justify-center">
                <Quote size={12} className="text-white fill-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[var(--color-rose-gold)] text-[var(--color-rose-gold)]" />
                ))}
              </div>

              <p className={`text-xs md:text-sm leading-relaxed text-gray-600 italic mb-6 flex-1 ${isRtl ? 'font-arabic' : ''}`}>
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="w-8 h-8 rounded-full bg-[var(--color-rose-gold)]/10 flex items-center justify-center mb-2">
                <span className="text-xs font-bold text-[var(--color-rose-gold)]">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.15em] font-semibold text-[var(--color-luxury-black)]">
                {testimonial.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
