'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { TicketPercent, Truck, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useLocale } from 'next-intl';

const DEFAULT_BAR_ITEMS = [
  { type: 'brand', text: 'DIOR', slug: 'dior' },
  { type: 'brand', text: 'CHANEL', slug: 'chanel' },
  { type: 'brand', text: 'GUCCI', slug: 'gucci' },
  { type: 'brand', text: 'MAC', slug: 'mac' },
  { type: 'brand', text: 'YSL', slug: 'ysl' },
  { type: 'brand', text: 'FENTY BEAUTY', slug: 'fenty-beauty' },
  { type: 'brand', text: 'RARE BEAUTY', slug: 'rare-beauty' },
  { type: 'brand', text: 'ESTÉE LAUDER', slug: 'estee-lauder' },
  { type: 'brand', text: 'CHARLOTTE TILBURY', slug: 'charlotte-tilbury' },
  { type: 'brand', text: 'HUDA BEAUTY', slug: 'huda-beauty' },
  { type: 'brand', text: 'NARS', slug: 'nars' },
  { type: 'brand', text: 'TOM FORD', slug: 'tom-ford' },
  { type: 'brand', text: 'LANCÔME', slug: 'lancome' },
  { type: 'brand', text: 'PRADA', slug: 'prada' },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'coupon': return <TicketPercent size={14} className="text-[var(--color-rose-gold)]" />;
    case 'shipping': return <Truck size={14} className="text-[var(--color-rose-gold)]" />;
    case 'offer': return <Zap size={14} className="text-[var(--color-rose-gold)]" />;
    default: return null;
  }
};

export default function TopBanner() {
  return (
    <div className="w-full bg-gray-50 overflow-hidden py-2.5 border-y border-gray-100 relative h-9 md:h-11">
      <div className="absolute top-0 left-0 h-full flex items-center">
        <div 
          className="flex whitespace-nowrap items-center animate-scroll"
          style={{
            animation: 'banner-scroll 60s linear infinite',
            width: 'max-content'
          }}
        >
          {/* Two identical sets for a perfect seamless loop */}
          {[1, 2].map((set) => (
            <div key={`set-${set}`} className="flex items-center gap-10 md:gap-20 px-6 md:px-12">
              {DEFAULT_BAR_ITEMS.map((item, index) => (
                <div key={`item-${set}-${index}`} className="flex items-center gap-2 group">
                  <Link
                    href={`/shop?brand=${item.slug}`}
                    className="text-gray-500 text-[10px] md:text-xs font-sans tracking-[0.2em] font-semibold hover:text-[var(--color-rose-gold)] transition-colors"
                  >
                    {item.text}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes banner-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
