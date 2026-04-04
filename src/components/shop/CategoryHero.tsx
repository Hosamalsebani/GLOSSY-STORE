'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

interface CategoryHeroProps {
  name: string;
  image?: string;
  description?: string;
  productCount?: number;
}

export default function CategoryHero({ name, image, description, productCount }: CategoryHeroProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <div className="relative h-[250px] md:h-[400px] w-full overflow-hidden mb-8 md:mb-12">
      {/* Background Image with Zoom Animation */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "linear" }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="w-full h-full bg-cover bg-center transition-opacity duration-700"
          style={{ 
            backgroundImage: `url(${image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200'})`,
          }}
        />
        {/* Luxury Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 z-10" />
        <div className="absolute inset-0 bg-[var(--color-luxury-black)]/10 z-10" />
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="max-w-4xl"
        >
          {/* Subtle Accent Line */}
          <div className="flex justify-center mb-4">
            <div className="h-[2px] w-12 bg-[var(--color-rose-gold)]" />
          </div>

          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4 tracking-tight ${isRtl ? 'font-arabic' : ''}`}>
            {name}
          </h1>

          {description && (
            <p className="text-white/90 text-sm md:text-lg max-w-2xl mx-auto mb-6 font-light leading-relaxed">
              {description}
            </p>
          )}

          {productCount !== undefined && (
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm uppercase tracking-widest font-medium">
               <span>{productCount}</span>
               <span className={isRtl ? 'font-arabic' : ''}>
                 {isRtl ? 'منتج' : 'Products'}
               </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Luxury Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10" />
    </div>
  );
}
