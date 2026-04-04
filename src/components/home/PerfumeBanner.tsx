'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop';

export default function PerfumeBanner() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [bannerImage, setBannerImage] = useState(DEFAULT_BANNER);

  useEffect(() => {
    async function fetchBanner() {
      const supabase = createClient();
      const { data } = await supabase
        .from('sliders')
        .select('*')
        .eq('placement', 'perfume-banner')
        .order('sort_order', { ascending: true })
        .limit(1);
      if (data && data.length > 0 && data[0].image_url) {
        setBannerImage(data[0].image_url);
      }
    }
    fetchBanner();
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-4">
      <Link
        href="/category/perfumes"
        className="block relative h-[180px] md:h-[260px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
      >
        {/* Background Image */}
        <img
          src={bannerImage}
          alt="Luxury Perfumes Collection"
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
        />

        {/* Elegant overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${isRtl ? 'from-transparent via-black/30 to-black/80' : 'from-black/80 via-black/30 to-transparent'}`} />

        {/* Gold decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

        {/* Content */}
        <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
          <div className={`flex items-center gap-2 text-amber-400 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Sparkles size={16} />
            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] ${isRtl ? 'font-arabic tracking-normal' : ''}`}>
              {isRtl ? 'مجموعة حصرية' : 'EXCLUSIVE COLLECTION'}
            </span>
          </div>

          <h2 className={`text-3xl md:text-5xl font-black text-white mb-2 leading-tight ${isRtl ? 'font-arabic' : ''}`}>
            {isRtl ? 'عالم العطور الفاخرة' : 'Luxury Fragrance World'}
          </h2>

          <p className={`text-sm md:text-base text-gray-300 max-w-md mb-4 ${isRtl ? 'font-arabic' : ''}`}>
            {isRtl
              ? 'أشهر العلامات العالمية في مكان واحد'
              : 'The most prestigious brands in one place'}
          </p>

          <div className={`flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all group-hover:border-amber-400/50 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className={isRtl ? 'font-arabic' : ''}>{isRtl ? 'تسوقي الآن' : 'Shop Now'}</span>
            {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </div>
        </div>
      </Link>
    </section>
  );
}
