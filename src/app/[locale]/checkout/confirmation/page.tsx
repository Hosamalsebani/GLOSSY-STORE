'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { CheckCircle, Package, ArrowRight, Home, Search, Copy, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LoyaltyCelebration from '@/components/loyalty/LoyaltyCelebration';

function ConfirmationContent() {
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
        
        <h1 className="text-4xl font-serif mb-4 text-[var(--color-luxury-black)]">Order Confirmed</h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase from Glossy.</p>
        <p className="text-gray-500 mb-8">We've received your order and will begin processing it right away.</p>
        
        <div className="bg-gray-50 p-6 mb-6 text-left border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Order Number</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg text-[var(--color-luxury-black)]">{orderNumber || 'Processing...'}</span>
              {orderNumber && (
                <button 
                  onClick={handleCopy}
                  className="p-1 text-gray-400 hover:text-[var(--color-luxury-black)] transition-colors"
                  title="Copy order number"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-rose-gold)] font-medium bg-rose-50 px-4 py-2 rounded-full">
            <Package size={18} />
            <span className="text-sm">Preparing to Ship</span>
          </div>
        </div>

        {/* Tracking tip */}
        <div className="bg-amber-50 border border-amber-100 p-4 mb-10 rounded-md text-left flex items-start gap-3">
          <Search size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Save your order number <strong>{orderNumber}</strong>. 
            You can track your order status anytime from your{' '}
            <Link href="/account" className="underline font-medium hover:text-amber-900">account page</Link>.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/account" 
            className="px-8 py-4 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2"
          >
            <Search size={16} /> Track My Order
          </Link>
          <Link 
            href="/shop" 
            className="px-8 py-4 bg-white border border-gray-200 text-[var(--color-luxury-black)] hover:border-[var(--color-luxury-black)] transition-colors uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
