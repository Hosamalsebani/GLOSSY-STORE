'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PAYMENT_METHODS, type PaymentMethod } from '@/lib/constants';
import { useLocale } from 'next-intl';

export default function StickyPaymentBar() {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-4 md:hidden"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)] py-3 px-6 flex flex-col items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 font-tajawal">
              {locale === 'ar' ? 'وسائل دفع آمنة 100%' : '100% SECURE PAYMENTS'}
            </span>
            <div className="flex items-center justify-center gap-5">
              {PAYMENT_METHODS.filter(m => m.id !== 'cod' && m.id !== 'wallet').slice(0, 6).map((method: PaymentMethod) => (
                <div key={method.id} className="h-4 w-auto">
                  <img 
                    src={method.icon} 
                    alt={method.id} 
                    className="h-full w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
