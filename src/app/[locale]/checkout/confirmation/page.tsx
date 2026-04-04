'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CheckCircle, Package, ArrowRight, Home, Search, Copy, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LoyaltyCelebration from '@/components/loyalty/LoyaltyCelebration';

function ConfirmationContent({ locale }: { locale: string }) {
  const t = useTranslations('Checkout');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('oid') || '';
  const earnedPoints = parseInt(searchParams.get('pts') || '0', 10);
  const [copied, setCopied] = useState(false);

  // Generate the display order number from the real order ID
  const orderNumber = orderId
    ? `GL-${orderId.slice(0, 8).toUpperCase()}`
    : '';

  const handleCopy = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-20 px-4">
      {/* Loyalty Celebration Effect */}
      {earnedPoints > 0 && <LoyaltyCelebration points={earnedPoints} />}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-10 md:p-16 max-w-2xl w-full text-center border border-gray-100 shadow-sm relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={40} />
        </motion.div>
        
        <h1 className="text-4xl font-serif mb-4 text-[var(--color-luxury-black)]">{t('orderConfirmed')}</h1>
        <p className="text-gray-500 mb-2">{t('thankYou')}</p>
        <p className="text-gray-500 mb-8">{t('receivedOrder')}</p>
        
        <div className="bg-gray-50 p-6 mb-6 text-left border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">{t('orderNumberLabel')}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg text-[var(--color-luxury-black)]">{orderNumber || 'Processing...'}</span>
              {orderNumber && (
                 <button 
                  onClick={handleCopy}
                  className="p-1 text-gray-400 hover:text-[var(--color-luxury-black)] transition-colors"
                  title={t('copyOrderNumber')}
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-rose-gold)] font-medium bg-rose-50 px-4 py-2 rounded-full">
            <Package size={18} />
            <span className="text-sm">{t('preparingToShip')}</span>
          </div>
        </div>

        {/* Tracking tip */}
        <div className="bg-amber-50 border border-amber-100 p-4 mb-10 rounded-md text-left flex items-start gap-3">
          <Search size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            {t.rich('saveOrderNumber', {
              orderNumber: orderNumber,
              bold: (chunks) => <strong>{chunks}</strong>,
              link: (chunks) => <Link href="/account" className="underline font-medium hover:text-amber-900">{chunks}</Link>
            })}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/account" 
            className="px-8 py-4 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2"
          >
            <Search size={16} /> {t('trackMyOrder')}
          </Link>
          <Link 
            href="/shop" 
            className="px-8 py-4 bg-white border border-gray-200 text-[var(--color-luxury-black)] hover:border-[var(--color-luxury-black)] transition-colors uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2"
          >
            {t('continueShopping')} <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ConfirmationContent locale={locale} />
    </Suspense>
  );
}
