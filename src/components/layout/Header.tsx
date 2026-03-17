'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, User, ShoppingBag, Heart, Menu, X, Home, BookOpen, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import LocaleSwitcher from '../ui/LocaleSwitcher';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { createClient } from '@/utils/supabase/client';
import TopBanner from './TopBanner';

export default function Header() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const cartItems = useAppStore((state) => state.cart);
  const { login, logout } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

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

    // Fetch categories for nav
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
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
  }, [login, logout, supabase]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: '/', label: t('home') },
    ...categories.map(cat => ({
      href: `/category/${cat.slug}`,
      label: locale === 'ar' ? cat.name_ar : cat.name_en
    })),
    { href: '/mystery-boxes', label: 'Mystery Boxes' },
    { href: '/tips', label: t('tips') },
  ];

  return (
    <>
      {/* Dynamic Brand & Coupon Slider */}
      <TopBanner />

      {/* Main Header - compact on mobile */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 bg-[var(--color-rose-gold)] ${scrolled ? 'shadow-lg' : ''}`}>
        <div className="container mx-auto px-3 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-24">

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-1.5 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              suppressHydrationWarning
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo - centered on mobile */}
            <Link href="/" className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0">
              <div className="relative h-16 w-16 md:h-20 md:w-20 animate-logo">
                <Image
                  src="/images/logo.png"
                  alt="Glossy"
                  fill
                  className="object-contain brightness-0"
                  priority
                />
              </div>
              <span className="hidden md:block text-[var(--color-luxury-black)] text-3xl font-serif tracking-[0.2em] font-black drop-shadow-sm">GLOSSY</span>
            </Link>

            {/* Desktop Pill Navigation */}
            <nav className="hidden lg:flex items-center gap-2 max-w-[60%] overflow-x-auto no-scrollbar">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-white/20 text-white hover:bg-white hover:text-[var(--color-luxury-black)] transition-all duration-300 backdrop-blur-sm whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2 md:gap-5">
              <LocaleSwitcher />

              <Link href="/shop" aria-label="Search" className="text-white hover:text-white/70 transition-colors hidden md:block">
                <Search size={22} strokeWidth={1.5} />
              </Link>
              <Link href="/account" className="text-white hover:text-white/70 transition-colors hidden md:block">
                <User size={22} strokeWidth={1.5} />
              </Link>
              <Link href="/account/wishlist" className="text-white hover:text-white/70 transition-colors hidden md:block">
                <Heart size={22} strokeWidth={1.5} />
              </Link>
              <Link href="/cart" className="relative text-white hover:text-white/70 transition-colors">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-white text-[var(--color-luxury-black)] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Slide-in Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-14 left-0 w-full bg-white shadow-xl pb-4 z-50 overflow-y-auto max-h-[80vh]">
            <nav className="flex flex-col px-4 pt-3 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 px-4 text-sm font-semibold text-gray-700 rounded-xl hover:bg-[var(--color-rose-gold)]/10 hover:text-[var(--color-rose-gold)] transition-all border-b border-gray-50 last:border-0 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation - Realistic Premium App Style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-safe">
        <div className="flex items-center justify-around h-16">
          <Link href="/" className="flex flex-col items-center justify-center p-2 text-[var(--color-rose-gold)]" aria-label={t('home')}>
            <Home size={24} strokeWidth={1.8} />
          </Link>
          <Link href="/shop" className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-[var(--color-rose-gold)] transition-colors" aria-label="Shop">
            <Search size={24} strokeWidth={1.8} />
          </Link>
          <Link href="/tips" className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-[var(--color-rose-gold)] transition-colors" aria-label="Beauty Tips">
            <Sparkles size={24} strokeWidth={1.8} />
          </Link>
          <Link href="/account/wishlist" className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-[var(--color-rose-gold)] transition-colors" aria-label="Wishlist">
            <Heart size={24} strokeWidth={1.8} />
          </Link>
          <Link href="/account" className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-[var(--color-rose-gold)] transition-colors" aria-label={t('login')}>
            <User size={24} strokeWidth={1.8} />
          </Link>
        </div>
      </nav>
    </>
  );
}
