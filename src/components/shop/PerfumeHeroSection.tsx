'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

const PERFUME_BRANDS = [
  { name: 'Dior', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Dior_Logo.svg' },
  { name: 'Chanel', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Chanel_logo-no5.svg' },
  { name: 'YSL', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/YSL_Logo.svg' },
  { name: 'Tom Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Tom_Ford_Logo.svg' },
  { name: 'Gucci', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/79/1960s_Gucci_Logo.svg' },
  { name: 'Versace', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Versace_logo.png' },
  { name: 'Burberry', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Burberry_Logo.svg' },
  { name: 'Prada', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Prada-Logo.svg' },
  { name: 'Armani', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Giorgio-Armani-Logo.svg' },
  { name: 'Dolce & Gabbana', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Dolce_%26_Gabbana_logo.svg' },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1594035910387-fea081d93f8f?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop',
];

export default function PerfumeHeroSection() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll marquee
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animationId: number;
    let scrollPos = 0;
    const speed = 0.4;

    const animate = () => {
      scrollPos += speed;
      if (scrollPos >= el.scrollWidth / 2) scrollPos = 0;
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative">
      {/* Cinematic Hero - Full viewport height */}
      <div className="relative h-[50vh] md:h-[65vh] overflow-hidden bg-[#0a0a0a]">
        {/* Background collage */}
        <div className="absolute inset-0 grid grid-cols-3 gap-0">
          {HERO_IMAGES.map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110"
              />
            </div>
          ))}
        </div>

        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {/* Decorative element */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-amber-400/60" />
            <Sparkles size={18} className="text-amber-400/80" />
            <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>

          <p className={`text-amber-400/90 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4 ${isRtl ? 'font-arabic tracking-wider' : ''}`}>
            {isRtl ? 'عالم من الأناقة والفخامة' : 'A WORLD OF ELEGANCE & LUXURY'}
          </p>

          <h1 className={`text-5xl md:text-8xl font-black text-white mb-4 leading-none ${isRtl ? 'font-arabic' : ''}`}>
            {isRtl ? 'العطور' : 'Perfumes'}
          </h1>

          <p className={`text-gray-400 text-sm md:text-lg max-w-xl leading-relaxed mb-8 ${isRtl ? 'font-arabic' : ''}`}>
            {isRtl
              ? 'اكتشفي أرقى العطور العالمية المختارة بعناية، من أشهر دور الأزياء الفرنسية والإيطالية'
              : 'Discover the finest fragrances from the world\'s most prestigious French & Italian fashion houses'}
          </p>

          {/* Scroll indicator */}
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-amber-400/80 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Brands Marquee */}
      <div className="bg-[#0f0f0f] border-t border-b border-amber-400/10 py-6 overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0f0f0f] to-transparent z-10" />
        
        <div className="text-center mb-3">
          <span className={`text-[9px] md:text-[10px] uppercase font-bold text-amber-400/50 tracking-[0.4em] ${isRtl ? 'font-arabic tracking-wider' : ''}`}>
            {isRtl ? 'علاماتنا التجارية' : 'OUR BRANDS'}
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-12 md:gap-16 items-center overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {[...PERFUME_BRANDS, ...PERFUME_BRANDS].map((brand, i) => (
            <Link
              key={`${brand.name}-${i}`}
              href={`/category/perfumes?brand=${brand.name.toLowerCase()}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-500 group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2.5 group-hover:border-amber-400/30 group-hover:bg-white/10 transition-all">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <span className="text-[8px] md:text-[9px] text-gray-500 group-hover:text-amber-400/80 font-medium tracking-[0.2em] uppercase transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
    </div>
  );
}
