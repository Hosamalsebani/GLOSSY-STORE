'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useTranslations, useLocale } from 'next-intl';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '@/utils/video';

type BeautyTip = {
  id: string;
  image_url: string;
  video_url: string;
  title_en: string;
  title_ar: string;
  created_at: string;
};

export default function BeautyTipsSlider() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const [tips, setTips] = useState<BeautyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const { data, error } = await supabase
          .from('beauty_tips')
          .select('id, image_url, video_url, title_en, title_ar, created_at')
          .order('created_at', { ascending: false })
          .limit(8);

        if (!error && data) setTips(data);
      } catch (err) {
        console.error('Error fetching beauty tips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const isRtl = locale === 'ar';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      let scrollAmount = 200;
      if (direction === 'left') {
        scrollAmount = isRtl ? 200 : -200;
      } else {
        scrollAmount = isRtl ? -200 : 200;
      }
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) return null; // Or skeleton

  if (tips.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="px-4 md:container md:mx-auto md:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-xl md:text-3xl font-serif text-[var(--color-luxury-black)] flex items-center gap-3 ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}>
            <span className="w-8 h-[2px] bg-[var(--color-rose-gold)] hidden md:block"></span>
            {t('beautyTips')}
          </h2>
          <Link 
            href="/tips" 
            className="text-xs uppercase tracking-widest font-bold text-[var(--color-rose-gold)] hover:text-[var(--color-luxury-black)] transition-colors"
          >
            {t('viewAll')}
          </Link>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <button 
            onClick={() => scroll('left')} 
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all hidden md:flex"
            aria-label={t('scrollLeft')}
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button 
            onClick={() => scroll('right')} 
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-[var(--color-rose-gold)] hover:text-white transition-all hidden md:flex"
            aria-label={t('scrollRight')}
          >
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          <div 
            ref={scrollRef} 
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[140px] md:min-w-[180px] aspect-[9/16] relative rounded-2xl overflow-hidden snap-start group cursor-pointer"
              >
                <Link href={`/tips/${tip.id}`} className="block w-full h-full">
                  {/* Media Preview */}
                  {tip.video_url ? (
                    isYouTubeUrl(tip.video_url) ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <img 
                          src={tip.image_url} 
                          alt="" 
                          className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Play size={20} className="text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <video 
                        src={tip.video_url}
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )
                  ) : (
                    <img 
                      src={tip.image_url} 
                      alt={locale === 'ar' ? tip.title_ar : tip.title_en}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className={`text-white text-xs md:text-sm font-medium leading-tight line-clamp-2 ${isRtl ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRtl ? tip.title_ar : tip.title_en}
                    </h3>
                  </div>

                  {/* Video Badge */}
                  {tip.video_url && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
