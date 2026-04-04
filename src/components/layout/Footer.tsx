'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { Loader2, CheckCircle2, AlertCircle, Send, Instagram, MessageCircle, Facebook } from 'lucide-react';
import Image from 'next/image';
import { PAYMENT_METHODS } from '@/lib/constants';
import { useLocale } from 'next-intl';

interface StoreSettings {
  instagram_url?: string;
  whatsapp_number?: string;
  tiktok_url?: string;
  facebook_url?: string;
  snapchat_url?: string;
}

export default function Footer() {
  const t = useTranslations('Footer');
  const navT = useTranslations('Navigation');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [message, setMessage] = useState('');
  const supabase = createClient();
  
  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
        if (data) setStoreSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, [supabase]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          setMessage(t('alreadySubscribed'));
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage(t('subscribeSuccess'));
        setEmail('');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      console.error('Subscription error:', err);
      setStatus('error');
      setMessage(errorMsg);
    }
  };
  
  return (
    <footer className="bg-[#fffbfb] border-t border-[#f8e7e9] text-slate-900 overflow-hidden">
      {/* Newsletter Strip - Modern Light Pink */}
      <div className="bg-[#fff0f3] py-12 border-b border-[#fef0f2]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-start">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[var(--color-rose-gold)] mb-2">
                {t('newsletterTitle')}
              </h3>
              <p className="text-slate-500 text-sm md:text-base">
                {t('newsletterSubtitle')}
              </p>
            </div>
            <div className="flex-1 w-full md:w-auto">
              {status === 'success' ? (
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-green-100 rounded-2xl px-10 py-6 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 shadow-xl shadow-green-900/5">
                  <div className="bg-green-500 rounded-full p-2">
                    <CheckCircle2 className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg">{message || t('subscribeSuccess')}</h4>
                    <p className="text-slate-500 text-sm">{t('alreadySubscribed') ? "" : "Check your inbox for exclusive offers."}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row w-full gap-4 items-center">
                  <div className="relative w-full md:w-96">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      disabled={status === 'loading'}
                      className="w-full bg-white border border-[#f8d0d6] rounded-full px-8 py-5 text-base outline-none focus:ring-4 focus:ring-[var(--color-rose-gold)]/10 focus:border-[var(--color-rose-gold)] transition-all disabled:opacity-50 shadow-sm placeholder:text-slate-300"
                      required
                    />
                    {status === 'error' && (
                      <div className="absolute -bottom-7 right-6 flex items-center gap-2 text-red-500 text-sm font-medium animate-bounce">
                        <AlertCircle size={14} />
                        <span>{message}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full md:w-auto bg-slate-900 text-white rounded-full px-12 py-5 text-base font-bold hover:bg-[var(--color-rose-gold)] active:scale-95 transition-all duration-500 disabled:opacity-50 shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    {status === 'loading' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span className="relative z-10">{t('subscribe')}</span>
                        <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform rtl:group-hover:-translate-x-1 relative z-10" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
      </div>
      </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 md:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          
          {/* Brand Identity & Contact */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 group">
                <Image 
                   src="/images/logo.png" 
                   alt="Glossy" 
                   fill 
                   sizes="64px"
                   className="object-contain transition-transform duration-500 group-hover:rotate-12" 
                />
              </div>
              <span className="text-3xl font-serif tracking-[0.2em] font-black text-[var(--color-rose-gold)]">
                GLOSSY
              </span>
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              {t('aboutText')}
            </p>

            {/* Contact & Social Section */}
            <div className="space-y-6 pt-2">
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 font-tajawal">
                  {t('followUs')}
                </h4>
                <div className="flex flex-wrap gap-4">
                  {storeSettings?.instagram_url && (
                    <a href={storeSettings.instagram_url} target="_blank" rel="noopener noreferrer" 
                       className="text-[#E4405F] hover:scale-125 transition-all duration-300 drop-shadow-sm" aria-label="Instagram">
                      <Instagram size={22} />
                    </a>
                  )}
                  {storeSettings?.whatsapp_number && (
                    <a href={`https://wa.me/${storeSettings.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" 
                       className="text-[#25D366] hover:scale-125 transition-all duration-300 drop-shadow-sm" aria-label="WhatsApp">
                      <MessageCircle size={22} />
                    </a>
                  )}
                  {storeSettings?.tiktok_url && (
                    <a href={storeSettings.tiktok_url} target="_blank" rel="noopener noreferrer" 
                       className="text-slate-900 hover:scale-125 transition-all duration-300 drop-shadow-sm" aria-label="TikTok">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.92-1.76 5.46-1.25 1.54-3.1 2.5-5.07 2.68-1.98.18-4.04-.15-5.73-1.24-1.69-1.08-2.92-2.78-3.41-4.73-.49-1.95-.27-4.05.68-5.83.95-1.78 2.54-3.14 4.41-3.79s3.94-.52 5.76.1v4.12c-1.17-.55-2.58-.65-3.83-.24s-2.28 1.3-2.88 2.45c-.6 1.15-.65 2.5-.16 3.69.5 1.19 1.48 2.11 2.68 2.52 1.2.41 2.56.32 3.69-.26 1.14-.58 1.99-1.58 2.37-2.82.38-1.24.26-.33-3.76V.02z"/></svg>
                    </a>
                  )}
                  {storeSettings?.facebook_url && (
                    <a href={storeSettings.facebook_url} target="_blank" rel="noopener noreferrer" 
                       className="text-[#1877F2] hover:scale-125 transition-all duration-300 drop-shadow-sm" aria-label="Facebook">
                      <Facebook size={22} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Groupings */}
          <div>
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.2em] text-[var(--color-rose-gold)]">{t('shopTitle')}</h3>
            <ul className="space-y-4">
              <li><Link href="/category/makeup" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{navT('makeup')}</Link></li>
              <li><Link href="/category/skincare" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{navT('skincare')}</Link></li>
              <li><Link href="/category/perfumes" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{navT('perfumes')}</Link></li>
              <li><Link href="/mystery-boxes" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{navT('mysteryBoxes')}</Link></li>
              <li><Link href="/tips" className="text-[var(--color-rose-gold)] font-bold hover:text-slate-900 transition-colors text-[13px]">✨ {t('beautyTips')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.2em] text-[var(--color-rose-gold)]">{t('helpTitle')}</h3>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{t('contactUs')}</Link></li>
              <li><Link href="/shipping" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{t('shippingReturns')}</Link></li>
              <li><Link href="/faq" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{t('faq')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.2em] text-[var(--color-rose-gold)]">{t('accountTitle')}</h3>
            <ul className="space-y-4">
              <li><Link href="/account" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{t('myAccount')}</Link></li>
              <li><Link href="/account/orders" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{t('orderTracking')}</Link></li>
              <li><Link href="/account/wishlist" className="text-slate-500 hover:text-[var(--color-rose-gold)] transition-colors text-[13px]">{t('wishlist')}</Link></li>
            </ul>
          </div>

          {/* Secure Payments Section */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.2em] text-[var(--color-rose-gold)]">{t('securePayments')}</h3>
            <div className="flex flex-wrap gap-4 items-center">
              {PAYMENT_METHODS.filter(m => m.id !== 'cod' && m.id !== 'wallet').slice(0, 9).map((method) => (
                <div key={method.id} className="h-6 w-auto flex items-center justify-center hover:scale-110 transition-all duration-300">
                  <img 
                    src={method.icon} 
                    alt={method.id} 
                    className="h-full w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        

        {/* Bottom Bar - Elegant & Minimal */}
        <div className="border-t border-[#f8e7e9] pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-tajawal text-center md:text-start">
            <p>&copy; {mounted ? new Date().getFullYear() : ''} GLOSSY LIBYA. {t('allRightsReserved')}</p>
          </div>
          
          <div className="flex items-center gap-8 text-[11px] text-slate-400 uppercase tracking-widest font-medium">
            <Link href="/privacy" className="hover:text-[var(--color-rose-gold)] transition-colors">{t('privacyPolicy')}</Link>
            <span className="w-1 h-1 bg-[#f8e7e9] rounded-full hidden md:block"></span>
            <Link href="/terms" className="hover:text-[var(--color-rose-gold)] transition-colors">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-rose-gold)]/20 to-transparent"></div>
    </footer>
  );
}
