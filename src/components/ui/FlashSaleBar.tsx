'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronRight, Zap } from 'lucide-react';

export default function FlashSaleBar() {
  const locale = useLocale();
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 23, minutes: 59, seconds: 59 });
      } else {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return null;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const goldGradient = 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)';

  return (
    <div 
      className="flash-sale-bar"
      style={{ 
        background: goldGradient,
        backgroundImage: goldGradient,
        backgroundColor: '#D4AF37' // Fallback
      }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between py-1 relative z-10">
        
        {/* Left: Compact Message */}
        <div className="flex items-center gap-2 md:gap-4 text-black">
          <Zap className="w-3 h-3 text-black fill-black" />
          <h2 className="promo-main font-bold">
            {locale === 'ar' ? 'تخفيضات 50% تنتهي خلال:' : 'FLASH SALE! 50% OFF ends in:'}
          </h2>
        </div>

        {/* Right: Inline Timer & Small Shop Button */}
        <div className="flex items-center gap-3 md:gap-8 text-black">
          <div className="timer-inline">
            <span className="num">{formatNumber(timeLeft.hours)}</span>
            <span className="sep">:</span>
            <span className="num">{formatNumber(timeLeft.minutes)}</span>
            <span className="sep">:</span>
            <span className="num">{formatNumber(timeLeft.seconds)}</span>
          </div>

          <Link href="/shop" className="btn-shop-slim">
            <span>{locale === 'ar' ? 'تسوق' : 'Shop Now'}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .flash-sale-bar {
          position: relative;
          color: #000;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          border-bottom: 2px solid rgba(0,0,0,0.1);
          width: 100%;
          z-index: 9999;
          min-height: 35px;
          display: flex;
          align-items: center;
        }

        .promo-main {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1;
          font-weight: 800;
        }

        .timer-inline {
          display: flex;
          align-items: center;
          gap: 2px;
          font-family: 'Inter', sans-serif;
          background: rgba(0, 0, 0, 0.15);
          padding: 2px 10px;
          border-radius: 4px;
        }

        .timer-inline .num {
          font-size: 14px;
          font-weight: 900;
        }

        .timer-inline .sep {
          font-weight: 900;
          opacity: 0.7;
        }

        .btn-shop-slim {
          background: #000;
          color: #FCF6BA;
          padding: 4px 16px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .btn-shop-slim:hover {
          background: #222;
          transform: translateY(-1px);
        }

        @media (min-width: 768px) {
          .flash-sale-bar { min-height: 45px; }
          .promo-main { font-size: 14px; }
          .timer-inline .num { font-size: 22px; }
          .timer-inline { padding: 4px 18px; gap: 6px; }
          .btn-shop-slim { padding: 8px 30px; font-size: 13px; }
        }

        @media (max-width: 640px) {
          .promo-main { font-size: 9px; }
          .timer-inline { padding: 2px 8px; }
          .timer-inline .num { font-size: 13px; }
          .btn-shop-slim { padding: 4px 12px; font-size: 9px; }
        }
      `}</style>
    </div>
  );
}
