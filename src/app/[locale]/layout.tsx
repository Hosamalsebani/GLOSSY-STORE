import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthSync from '@/components/AuthSync';
import AccessDeniedBanner from '@/components/AccessDeniedBanner';
import GiftPopup from '@/components/ui/GiftPopup';
import RewardsSystem from '@/components/rewards/RewardsSystem';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import FlashSaleBar from '@/components/ui/FlashSaleBar';
import PageWrapper from '@/components/layout/PageWrapper';
import '../globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return {
    title: `Glossy | ${t('home')}`,
    description: 'Luxury Beauty Store',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Direction is RTL for Arabic
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@200;300;400;500;700;800;900&family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Barlow:wght@600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthSync />
          <Suspense fallback={null}>
            <AccessDeniedBanner />
          </Suspense>
          <GiftPopup />
          <RewardsSystem />
          <Header />
          <PageWrapper>
            <main className="flex-grow">
              {children}
            </main>
          </PageWrapper>
          <Footer />
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
