'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      {/* Premium Progress Bar (NiceOne Style) */}
      <div 
        className="h-[3px] bg-gradient-to-r from-[var(--color-rose-gold)] to-[var(--color-gold-luxury)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      
      {/* Full Page Subtle Overlay (Optional, but helps with perceived speed) */}
      <div className="fixed inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[var(--color-rose-gold)]/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-t-2 border-[var(--color-rose-gold)] rounded-full animate-spin" />
          <div className="mt-4 text-[var(--color-luxury-black)] text-[10px] uppercase tracking-[0.3em] font-medium text-center animate-pulse">
            Glossy
          </div>
        </div>
      </div>
    </div>
  );
}
