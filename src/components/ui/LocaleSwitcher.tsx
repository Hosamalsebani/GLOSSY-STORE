'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="text-sm font-medium tracking-wide uppercase hover:text-[var(--color-rose-gold)] transition-colors"
      aria-label="Toggle Language"
      suppressHydrationWarning
    >
      {locale === 'en' ? 'AR' : 'EN'}
    </button>
  );
}
