'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function LensesBanner() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-8 overflow-hidden group">
      <Link href="/category/lenses" className="block relative h-[180px] md:h-[240px] w-full bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer">
        {/* Background Image - Fixed (User image contains text) */}
        <img 
          src="/images/lenses_custom.png" 
          alt="Lenses Collection"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-in-out md:group-hover:scale-105"
        />
      </Link>
    </section>
  );
}

