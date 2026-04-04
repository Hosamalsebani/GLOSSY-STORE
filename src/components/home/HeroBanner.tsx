'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

type Slide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link?: string;
};

export default function HeroBanner({ 
  initialSlides = [],
  locale 
}: { 
  initialSlides?: Slide[],
  locale: string 
}) {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(initialSlides);

  useEffect(() => {
    if (initialSlides.length > 0) {
      setSlides(initialSlides);
    }
  }, [initialSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = useCallback((index: number) => setCurrent(index), []);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative w-full bg-white overflow-hidden">
      {/* Main Banner */}
      <div className="md:container md:mx-auto md:px-6">
        <div className="relative overflow-hidden md:rounded-[20px] md:mt-4 shadow-sm group">
          <Link href={slides[current]?.link || '/shop'} className="block">
            <div className="relative w-full aspect-square sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] bg-[#f9f9f9]">
              {slides.map((slide, index) => (
                <Image
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title || 'Glossy Beauty Banner'}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className={`object-cover transition-opacity duration-700 ${
                    index === current ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </Link>

          {/* Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(index); }}
                  className={`transition-all duration-300 rounded-full ${
                    index === current 
                      ? 'w-5 h-1.5 bg-white' 
                      : 'w-1.5 h-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
