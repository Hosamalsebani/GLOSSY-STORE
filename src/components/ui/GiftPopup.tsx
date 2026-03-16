'use client';

import React, { useState, useEffect } from 'react';
import { Gift, TicketPercent, Copy, X, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useLocale } from 'next-intl';

export default function GiftPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const locale = useLocale();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Check settings first
        const { data: settings } = await supabase
          .from('store_settings')
          .select('show_coupon_announcement')
          .single();

        if (!settings?.show_coupon_announcement) return;

        // Fetch strongest coupon
        const { data: coupons } = await supabase
          .from('coupons')
          .select('*')
          .eq('active', true)
          .or(`expiration_date.is.null,expiration_date.gt.${new Date().toISOString()}`)
          .order('discount_percentage', { ascending: false })
          .limit(1);

        if (coupons && coupons.length > 0) {
          setCoupon(coupons[0]);
          setIsVisible(true);
        }
      } catch (err) {
        console.error('Error fetching data for gift popup:', err);
      }
    }

    fetchData();
  }, [supabase]);

  const copyToClipboard = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible || !coupon) {
    return <div id="gift-popup-placeholder" style={{ display: 'none' }} aria-hidden="true"></div>;
  }

  return (
    <div id="gift-popup-container">
      {/* Floating Gift Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-[var(--color-rose-gold)] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce group max-md:bottom-[80px]"
        aria-label="Gift Box"
      >
        <div className="relative">
          <Gift size={28} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </div>
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-[var(--color-luxury-black)] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hidden md:block">
          {locale === 'ar' ? 'لديك هدية مفاجئة! 🎁' : 'You have a surprise gift! 🎁'}
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
            {/* Top Pattern/Decoration */}
            <div className="h-32 bg-gradient-to-br from-[var(--color-rose-gold)] to-[#D4AF37] relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                <Gift size={48} className="text-white" />
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 text-center">
              <h2 className="text-2xl font-serif font-bold text-[var(--color-luxury-black)] mb-2">
                {locale === 'ar' ? 'هدية حصرية لك!' : 'Exclusive Gift for You!'}
              </h2>
              <p className="text-gray-500 mb-8">
                {locale === 'ar' 
                  ? `استمتع بخصم ${coupon.discount_percentage}% على جميع مشترياتك` 
                  : `Enjoy ${coupon.discount_percentage}% off on all your purchases`}
              </p>

              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 relative group overflow-hidden">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">
                  {locale === 'ar' ? 'كود الخصم' : 'COUPON CODE'}
                </div>
                <div className="text-3xl font-mono font-bold tracking-widest text-[var(--color-rose-gold)] mb-4">
                  {coupon.code}
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-luxury-black)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-rose-gold)] transition-colors active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      {locale === 'ar' ? 'تم النسخ!' : 'Copied!'}
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      {locale === 'ar' ? 'نسخ الكود' : 'Copy Code'}
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest">
                {locale === 'ar' 
                  ? '* ينتهي قريباً - لا تضيع الفرصة' 
                  : '* Limited time offer - Don\'t miss out'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
