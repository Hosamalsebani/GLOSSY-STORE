'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface FlashSaleTimerProps {
  endDate: string;
  onExpire?: () => void;
  compact?: boolean;
}

export default function FlashSaleTimer({ endDate, onExpire, compact = false }: FlashSaleTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date();
      
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      };
    };

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      
      if (updated.expired) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (timeLeft.expired) return null;

  const format = (num: number) => num.toString().padStart(2, '0');

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
        <Timer size={10} />
        <span>{format(timeLeft.hours)}:{format(timeLeft.minutes)}:{format(timeLeft.seconds)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-4 p-4 bg-red-50 rounded-xl border border-red-100 shadow-sm">
      <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-wider">
        <span className="animate-pulse">🔥</span> Flash Offer Ends In:
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="bg-white text-red-600 font-mono text-2xl px-3 py-2 rounded-lg shadow-sm border border-red-100 min-w-[3rem] text-center">
            {format(timeLeft.hours)}
          </div>
          <span className="text-[10px] uppercase text-red-400 mt-1">Hours</span>
        </div>
        <div className="text-2xl font-mono text-red-300 pt-2">:</div>
        <div className="flex flex-col items-center">
          <div className="bg-white text-red-600 font-mono text-2xl px-3 py-2 rounded-lg shadow-sm border border-red-100 min-w-[3rem] text-center">
            {format(timeLeft.minutes)}
          </div>
          <span className="text-[10px] uppercase text-red-400 mt-1">Mins</span>
        </div>
        <div className="text-2xl font-mono text-red-300 pt-2">:</div>
        <div className="flex flex-col items-center">
          <div className="bg-white text-red-600 font-mono text-2xl px-3 py-2 rounded-lg shadow-sm border border-red-100 min-w-[3rem] text-center">
            {format(timeLeft.seconds)}
          </div>
          <span className="text-[10px] uppercase text-red-400 mt-1">Secs</span>
        </div>
      </div>
    </div>
  );
}
