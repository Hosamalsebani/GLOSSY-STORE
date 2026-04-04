'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromoSlider({ images }: { images: string[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4000); // تغيير الصورة كل 4 ثواني
    
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full md:container md:mx-auto md:py-6">
      <div className="relative w-full aspect-[21/9] md:aspect-[32/9] md:rounded-2xl overflow-hidden md:shadow-md border-y border-gray-100 md:border-x">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIdx]}
              alt={`Promo Banner ${currentIdx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={currentIdx === 0}
              unoptimized={true}
            />
          </motion.div>
        </AnimatePresence>

        {/* مؤشرات التنقل (النقاط) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/10 backdrop-blur-md px-2 py-1.5 rounded-full shadow-sm">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentIdx ? 'w-4 h-1.5 bg-white shadow-sm' : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
