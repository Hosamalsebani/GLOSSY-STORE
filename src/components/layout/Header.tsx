'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, User, ShoppingBag, Heart, Menu, X, Home, Sparkles, Bell } from 'lucide-react';
import Image from 'next/image';
import LocaleSwitcher from '../ui/LocaleSwitcher';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const cartItems = useAppStore((state) => state.cart);
  const { login, logout } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Create Supabase client once via ref — never re-created on re-render
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const isHome = pathname === '/' || pathname === '/ar' || pathname === '/en';
  const [isHeaderGlassy, setIsHeaderGlassy] = useState(isHome);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) login();
      else logout();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) login();
      else logout();
    });

    async function fetchCategories() {
      try {
        const { data } = await supabase
          .from('categories')
          .select('id, name_en, name_ar, slug')
          .order('name_en', { ascending: true });

        if (data) setCategories(data);
      } catch (err) {
        console.error('Error fetching categories for nav:', err);
      } finally {
        setLoadingCats(false);
      }
    }

    fetchCategories();

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Throttled scroll handler — fires at most once per 100ms on mobile
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10);
        setIsHeaderGlassy(isHome && window.scrollY < 450);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const cartItemCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const navLinks = useMemo(() => [
    { href: '/', label: t('home') },
    ...categories.map(cat => ({
      href: `/category/${cat.slug}`,
      label: locale === 'ar' ? cat.name_ar : cat.name_en
    })),
    { href: '/mystery-boxes', label: 'Mystery Boxes' },
    { href: '/tips', label: t('tips') },
  ], [categories, locale, t]);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Main Header */}
      <header 
        className={`${isHeaderGlassy ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 w-full transition-all duration-500 border-b ${
          isHeaderGlassy 
            ? 'bg-white/10 backdrop-blur-md border-white/5' 
            : 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-gray-100'
        }`}
      >
        {/* Promo Strip */}
        <div className="w-full bg-[#FFD5D1] text-[var(--color-primary)] py-2 text-center relative overflow-hidden">
          <p className="text-[10px] md:text-sm font-black tracking-wide">
            {isRtl ? 'خصم 20٪ على طلبك الأول باستخدام كود: NEW20' : '20% off your first order using code: NEW20'}
          </p>
        </div>

        <div className="container mx-auto px-3 md:px-6">

          <div className="flex flex-col md:block py-2 md:py-0">
            {/* Single row for Mobile/Desktop: Icons + Logo + Icons */}
            <div className="flex items-center justify-between gap-2 h-12 md:h-16 relative">

              {/* Menu Toggle (Mobile) */}
              <div className="flex items-center lg:hidden">
                <button
                  className={`p-1.5 rounded-full transition-colors ${isHeaderGlassy ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  suppressHydrationWarning
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Flexible Search Bar */}
              <div className="flex-1 flex justify-center max-w-2xl px-2">
                <Link href="/shop" className="block w-full">
                  <div className={`flex items-center gap-2.5 rounded-full px-4 py-2 w-full h-[38px] md:h-[44px] transition-colors ${
                    isHeaderGlassy ? 'bg-white/20 border border-white/20' : 'bg-[#F4F4F4]'
                  }`}>
                    <Search size={18} className={`shrink-0 ${isHeaderGlassy ? 'text-white' : 'text-[#999999]'}`} />
                    <span className={`text-[13px] md:text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis ${isHeaderGlassy ? 'text-white/80' : 'text-[#999999]'}`}>
                      {isRtl ? 'عن ماذا تبحث؟' : 'What are you looking for?'}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Right side icons */}
              <div className="flex items-center justify-end gap-1.5 md:gap-3 shrink-0">
                <Link href="/account" className={`transition-colors hidden md:flex items-center gap-1 ${isHeaderGlassy ? 'text-white hover:text-white/80' : 'text-gray-600 hover:text-[var(--color-rose-gold)]'}`}>
                  <User size={22} strokeWidth={1.5} />
                  <span className="text-xs hidden lg:inline">{isRtl ? 'حسابي' : 'Account'}</span>
                </Link>
                <Link href="/account/wishlist" className={`transition-colors hidden md:block ${isHeaderGlassy ? 'text-white hover:text-white/80' : 'text-gray-600 hover:text-[var(--color-rose-gold)]'}`}>
                  <Heart size={22} strokeWidth={1.5} />
                </Link>
                <Link href="/cart" className={`relative transition-all p-1.5 rounded-full ${isHeaderGlassy ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <ShoppingBag size={22} strokeWidth={1.8} />
                  {mounted && cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#E23049] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            
          </div>

          {/* Desktop Navigation */}
          {!isHeaderGlassy && (
            <nav className="hidden lg:flex items-center gap-2 pb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-t border-gray-50 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[var(--color-rose-gold)] transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile Slide-in Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-14 left-0 w-full bg-white shadow-xl pb-4 z-50 overflow-y-auto max-h-[80vh]">
            {/* Mobile Search */}
            <div className="px-4 py-3">
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
                  <Search size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-400">{isRtl ? 'مالذي تبحث عنه ؟' : 'Search...'}</span>
                </div>
              </Link>
            </div>
            <nav className="flex flex-col px-4 gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 px-4 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-[var(--color-rose-gold)] transition-all ${isRtl ? 'text-right' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation - 5 items strictly */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe touch-manipulation">
        <div className="flex items-center justify-around h-14">
          <Link href="/" prefetch={true} className="flex flex-col items-center justify-center p-2 text-black active:scale-95 transition-transform" aria-label={t('home')}>
            <Home size={22} strokeWidth={2.4} />
            <span className="text-[9px] mt-0.5 font-black text-black">{isRtl ? 'الرئيسية' : 'Home'}</span>
          </Link>
          <Link href="/shop" prefetch={true} className="flex flex-col items-center justify-center p-2 text-black active:scale-95 transition-transform" aria-label="Categories">
            <Menu size={22} strokeWidth={2.4} />
            <span className="text-[9px] mt-0.5 font-black text-black">{isRtl ? 'الأقسام' : 'Categories'}</span>
          </Link>
          <Link href="/tips" prefetch={true} className="flex flex-col items-center justify-center p-2 text-black active:scale-95 transition-transform" aria-label="Tips">
            <Sparkles size={22} strokeWidth={2.4} />
            <span className="text-[9px] mt-0.5 font-black text-black">{isRtl ? 'نصائح' : 'Tips'}</span>
          </Link>
          <Link href="/account" prefetch={true} className="flex flex-col items-center justify-center p-2 text-black active:scale-95 transition-transform" aria-label="Profile">
            <User size={22} strokeWidth={2.4} />
            <span className="text-[9px] mt-0.5 font-black text-black">{isRtl ? 'حسابي' : 'Profile'}</span>
          </Link>
          <Link href="/cart" prefetch={true} className="flex flex-col items-center justify-center p-2 text-black relative active:scale-95 transition-transform" aria-label="Cart">
            <ShoppingBag size={22} strokeWidth={2.4} />
            <span className="text-[9px] mt-0.5 font-black text-black">{isRtl ? 'السلة' : 'Cart'}</span>
            {mounted && cartItemCount > 0 && (
              <span className="absolute top-1 right-3 bg-[#E23049] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </>
  );
}
