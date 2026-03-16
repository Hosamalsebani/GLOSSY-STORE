'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('Footer');
  const navT = useTranslations('Navigation');
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [storeSettings, setStoreSettings] = useState<any>(null);
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
          setMessage('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setTimeout(() => {
        if (status !== 'loading') {
          // Allow retrying
        }
      }, 5000);
    }
  };
  
  return (
    <footer className="bg-[var(--color-rose-gold)] text-white">
      {/* Newsletter Strip */}
      <div className="bg-[var(--color-luxury-black)] py-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-serif mb-1">{t('newsletterTitle')}</h3>
              <p className="text-gray-400 text-sm">{t('newsletterSubtitle')}</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                disabled={status === 'loading'}
                className="bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-[var(--color-rose-gold)] transition-colors w-full md:w-72 disabled:opacity-50"
                required
                suppressHydrationWarning
              />
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-[var(--color-rose-gold)] text-white rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-white hover:text-[var(--color-luxury-black)] transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                suppressHydrationWarning
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> {t('subscribe')}</>}
              </button>
            </form>
          </div>
          {mounted && message && (
            <div className={`text-xs mt-3 flex items-center gap-2 justify-center md:justify-end ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {status === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 md:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-12">
          
          {/* Brand + Social */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative h-20 w-20 overflow-hidden">
                <Image 
                   src="/images/logo.png" 
                   alt="Glossy" 
                   fill 
                   className="object-contain brightness-0 invert" 
                />
              </div>
              <span className="text-white text-2xl font-serif tracking-[0.15em] font-bold">GLOSSY</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-6">
              {t('aboutText')}
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              {storeSettings?.instagram_url && (
                <a 
                  href={storeSettings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
              
              {/* WhatsApp */}
              {storeSettings?.whatsapp_number && (
                <a 
                  href={`https://wa.me/${storeSettings.whatsapp_number.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#25D366]/30 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
              
              {/* TikTok */}
              {storeSettings?.tiktok_url && (
                <a 
                  href={storeSettings.tiktok_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 6.34 6.34 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              
              {/* Facebook */}
              {storeSettings?.facebook_url && (
                <a 
                  href={storeSettings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1877F2]/30 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              
              {/* Snapchat */}
              {storeSettings?.snapchat_url && (
                <a 
                  href={storeSettings.snapchat_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFFC00]/20 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Snapchat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.504.504 0 01.2-.044c.12 0 .24.03.336.066.18.06.39.18.39.39a.482.482 0 01-.18.36c-.423.36-1.272.6-1.86.66a.455.455 0 00-.39.42v.036c-.024.18-.024.36.06.51.21.435 1.083 1.803 2.553 2.07a.455.455 0 01.36.42c0 .06-.015.12-.03.18-.09.36-.57.63-1.053.81-.255.09-.45.15-.585.195a.432.432 0 00-.285.285l-.015.06c-.06.24-.12.48-.39.48-.045 0-.09 0-.135-.015-.375-.06-.81-.18-1.35-.18-.15 0-.3.015-.45.03-1.275.15-2.25 1.275-4.2 1.275h-.06c-1.95 0-2.925-1.125-4.2-1.275a2.773 2.773 0 00-.45-.03c-.54 0-.975.12-1.35.18a.607.607 0 01-.135.015c-.27 0-.33-.24-.39-.48l-.015-.06a.432.432 0 00-.285-.285c-.135-.045-.33-.105-.585-.195-.48-.18-.96-.45-1.053-.81a.455.455 0 01-.03-.18c0-.21.18-.39.36-.42 1.47-.27 2.343-1.635 2.553-2.07.084-.15.084-.33.06-.51v-.036a.455.455 0 00-.39-.42c-.57-.06-1.44-.3-1.86-.66a.478.478 0 01-.18-.36c0-.21.21-.33.39-.39a.618.618 0 01.336-.066c.12 0 .24.015.2.044.374.18.734.301 1.033.301.198 0 .326-.045.401-.09a37.58 37.58 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.86 1.069 11.216.793 12.206.793z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold mb-5 uppercase tracking-[0.15em]">{t('shopTitle')}</h3>
            <ul className="space-y-3">
              <li><Link href="/category/makeup" className="text-white/70 hover:text-white transition-colors text-sm">{navT('makeup')}</Link></li>
              <li><Link href="/category/skincare" className="text-white/70 hover:text-white transition-colors text-sm">{navT('skincare')}</Link></li>
              <li><Link href="/category/perfumes" className="text-white/70 hover:text-white transition-colors text-sm">{navT('perfumes')}</Link></li>
              <li><Link href="/category/accessories" className="text-white/70 hover:text-white transition-colors text-sm">Accessories</Link></li>
              <li><Link href="/category/watches" className="text-white/70 hover:text-white transition-colors text-sm">Watches</Link></li>
              <li><Link href="/mystery-boxes" className="text-white/70 hover:text-white transition-colors text-sm">Mystery Boxes</Link></li>
              <li><Link href="/tips" className="text-[var(--color-rose-gold)] font-bold hover:text-white transition-colors text-sm">✨ {navT('tips')}</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-sm font-semibold mb-5 uppercase tracking-[0.15em]">{t('helpTitle')}</h3>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><Link href="/shipping" className="text-white/70 hover:text-white transition-colors text-sm">Shipping & Returns</Link></li>
              <li><Link href="/faq" className="text-white/70 hover:text-white transition-colors text-sm">FAQ</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-semibold mb-5 uppercase tracking-[0.15em]">{t('accountTitle')}</h3>
            <ul className="space-y-3">
              <li><Link href="/account" className="text-white/70 hover:text-white transition-colors text-sm">My Account</Link></li>
              <li><Link href="/account/orders" className="text-white/70 hover:text-white transition-colors text-sm">Order Tracking</Link></li>
              <li><Link href="/account/wishlist" className="text-white/70 hover:text-white transition-colors text-sm">Wishlist</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 mt-4 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
          <p>&copy; {mounted ? new Date().getFullYear() : ''} GLOSSY. {t('allRightsReserved')}</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('privacyPolicy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
