'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Gift, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export default function PromoBanner() {
  const locale = useLocale();
  const t = useTranslations('HomePage');
  const isRtl = locale === 'ar';

  return (
    <section className="overflow-hidden">
      <div className="w-full flex flex-col md:flex-row min-h-[350px] md:min-h-[500px]">
        {/* Image Side */}
        <div className="w-full md:w-1/2 min-h-[200px] md:min-h-full relative overflow-hidden">
          <img 
            className="absolute inset-0 w-full h-full object-cover"
            src="/images/promo_makeup.png"
            alt={t('promoSubtitle')}
          />
          <div className={`absolute inset-0 bg-gradient-to-r from-[var(--color-rose-gold)]/20 to-transparent ${isRtl ? 'rotate-180' : ''}`} />
        </div>
        
        {/* Content Side */}
        <div className={`w-full md:w-1/2 bg-[var(--color-luxury-black)] flex flex-col justify-center items-center md:items-start p-8 md:p-16 text-white ${isRtl ? 'md:text-right md:items-end text-center' : 'md:text-left text-center'} relative`}>
          <Sparkles className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} w-5 h-5 text-[var(--color-rose-gold)] opacity-30 hidden md:block`} />
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={`flex items-center gap-2 mb-3 justify-center ${isRtl ? 'md:justify-end' : 'md:justify-start'}`}>
              <Gift size={16} className="text-[var(--color-rose-gold)]" />
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-rose-gold)]">{t('promoLabel')}</span>
            </div>
            <h2 className={`text-2xl md:text-4xl font-serif mb-4 leading-tight ${isRtl ? 'font-arabic' : ''}`} dangerouslySetInnerHTML={{ __html: t.raw('promoTitle') }}>
            </h2>
            <p className="text-xs md:text-sm mb-6 text-white/60 font-light max-w-sm leading-relaxed">
              {t('promoSubtitle')}
            </p>
            <Link 
              href="/mystery-boxes" 
              className="inline-block px-8 py-3 bg-[var(--color-rose-gold)] text-white font-semibold tracking-widest uppercase text-xs rounded-full hover:bg-white hover:text-[var(--color-luxury-black)] transition-all active:scale-95"
            >
              {t('promoButton')}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
