'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

const BRANDS = [
  {
    id: 'chanel',
    name: 'Chanel',
    logo: 'https://www.google.com/s2/favicons?domain=chanel.com&sz=128',
    slug: 'chanel'
  },
  {
    id: 'dior',
    name: 'Dior',
    logo: 'https://www.google.com/s2/favicons?domain=dior.com&sz=128',
    slug: 'dior'
  },
  {
    id: 'mac',
    name: 'M.A.C',
    logo: 'https://www.google.com/s2/favicons?domain=maccosmetics.com&sz=128',
    slug: 'mac'
  },
  {
    id: 'loreal',
    name: 'L’Oréal',
    logo: 'https://www.google.com/s2/favicons?domain=loreal.com&sz=128',
    slug: 'loreal'
  },
  {
    id: 'colgate',
    name: 'Colgate',
    logo: 'https://www.google.com/s2/favicons?domain=colgate.com&sz=128',
    slug: 'colgate'
  },
  {
    id: 'nivea',
    name: 'Nivea',
    logo: 'https://www.google.com/s2/favicons?domain=nivea.com&sz=128',
    slug: 'nivea'
  },
  {
    id: 'dove',
    name: 'Dove',
    logo: 'https://www.google.com/s2/favicons?domain=dove.com&sz=128',
    slug: 'dove'
  },
  {
    id: 'gillette',
    name: 'Gillette',
    logo: 'https://www.google.com/s2/favicons?domain=gillette.com&sz=128',
    slug: 'gillette'
  },
  {
    id: 'sensodyne',
    name: 'Sensodyne',
    logo: 'https://www.google.com/s2/favicons?domain=sensodyne.com&sz=128',
    slug: 'sensodyne'
  },
  {
    id: 'lancome',
    name: 'Lancôme',
    logo: 'https://www.google.com/s2/favicons?domain=lancome.com&sz=128',
    slug: 'lancome'
  },
  {
    id: 'maybelline',
    name: 'Maybelline',
    logo: 'https://www.google.com/s2/favicons?domain=maybelline.com&sz=128',
    slug: 'maybelline'
  },
  {
    id: 'nars',
    name: 'NARS',
    logo: 'https://www.google.com/s2/favicons?domain=narscosmetics.com&sz=128',
    slug: 'nars'
  },
  {
    id: 'estee-lauder',
    name: 'Estée Lauder',
    logo: 'https://www.google.com/s2/favicons?domain=esteelauder.com&sz=128',
    slug: 'estee-lauder'
  }
];

export default function BrandShowcase() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-2 md:py-4 bg-white overflow-hidden relative">
      {/* Editorial Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
      
      <div className="md:container md:mx-auto px-4 md:px-8">
        <div className="relative">
          {/* Scroll Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div 
            ref={scrollRef}
            className="flex gap-0 overflow-x-auto no-scrollbar snap-x snap-mandatory min-hide-scrollbar border-y border-gray-100"
          >
            {BRANDS.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="min-w-[110px] md:min-w-[160px] snap-start border-r border-gray-50 last:border-r-0"
              >
                <Link 
                  href={`/shop?brand=${brand.slug}`}
                  className="group block relative"
                >
                  {/* Sticker Style Tile */}
                  <div className="aspect-square bg-white p-4 md:p-8 flex items-center justify-center transition-all duration-500 relative overflow-hidden group-hover:bg-gray-50">
                    {/* Gloss Shine Animation */}
                    <div className="absolute -inset-y-0 -left-full block w-1/2 h-full bg-gradient-to-r from-transparent via-rose-100/20 to-transparent skew-x-[-25deg] group-hover:left-[125%] transition-all duration-1000 z-20 pointer-events-none" />
                    
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="w-full h-auto max-h-[70%] object-contain transition-all duration-700 opacity-90 group-hover:opacity-100 scale-90 group-hover:scale-105 z-10 relative"
                      loading="lazy"
                    />
                    
                    {/* Minimalist Label (Overlay approach for sticker look) */}
                    <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {brand.name}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
