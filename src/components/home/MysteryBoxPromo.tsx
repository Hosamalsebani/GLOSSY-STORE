'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Gift, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function MysteryBoxPromo() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-4">
      <Link
        href="/mystery-boxes"
        className="block relative h-[180px] md:h-[260px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer group"
      >
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?q=80&w=2000&auto=format&fit=crop"
          alt="Mystery Box"
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
        />

        {/* Dark overlay gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent ${isRtl ? 'rotate-180' : ''}`} />

        {/* Discount Badge */}
        <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} z-20 bg-red-500 text-white font-bold px-4 py-1.5 rounded-full shadow-lg transform -rotate-3`}>
          <span className={`text-xs md:text-sm tracking-wide ${isRtl ? 'font-arabic' : ''}`}>{isRtl ? 'خصم 60%' : '60% OFF'}</span>
        </div>

        {/* Content */}
        <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-20 ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <Sparkles size={18} />
            <span className={`text-xs md:text-sm font-bold uppercase tracking-[0.2em] ${isRtl ? 'font-arabic tracking-normal' : ''}`}>
              {isRtl ? 'حصري من GLOSSY' : 'GLOSSY EXCLUSIVE'}
            </span>
          </div>

          <h2 className={`text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight ${isRtl ? 'font-arabic' : ''}`}>
            {isRtl ? 'صندوق الغموض ✦' : '✦ Mystery Box'}
          </h2>

          <p className={`text-sm md:text-base text-gray-300 font-medium max-w-md mb-4 ${isRtl ? 'font-arabic' : ''}`}>
            {isRtl
              ? 'منتجات تجميل فاخرة بقيمة تصل إلى ٣ أضعاف السعر!'
              : 'Luxury beauty products worth up to 3x the price!'}
          </p>

          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm text-gray-400 line-through">{isRtl ? '٢٥٠ د.ل' : '250 LYD'}</span>
            <span className="text-2xl font-black text-amber-400">{isRtl ? '٩٩ د.ل' : '99 LYD'}</span>
            <div className={`flex items-center gap-2 bg-amber-400 text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-amber-300 transition-all ${isRtl ? 'flex-row-reverse mr-3' : 'ml-3'}`}>
              <Gift size={16} />
              <span className={isRtl ? 'font-arabic' : ''}>{isRtl ? 'اكتشفي' : 'Discover'}</span>
              {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
