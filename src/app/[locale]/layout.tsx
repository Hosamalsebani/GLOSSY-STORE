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
import AnalyticsScripts from '@/components/layout/AnalyticsScripts';
import '../globals.css';

const BASE_URL = 'https://glossy-store-stnz.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const title = isAr
    ? 'جلوسي | متجر مستحضرات التجميل الفاخرة في ليبيا'
    : 'Glossy | Premium Beauty Store in Libya';

  const description = isAr
    ? 'تسوقي أفضل مستحضرات التجميل والعناية بالبشرة والعطور الفاخرة. شحن سريع لجميع مدن ليبيا. عروض حصرية وخصومات يومية على أشهر الماركات العالمية.'
    : 'Shop premium cosmetics, skincare, and luxury perfumes. Fast shipping across Libya. Exclusive deals and daily discounts on top international brands.';

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'ar': `${BASE_URL}/ar`,
        'en': `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: 'Glossy',
      locale: isAr ? 'ar_LY' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Glossy - Premium Beauty Store',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/images/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add your Google Search Console verification code when ready
      // google: 'your-verification-code',
    },
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

  // Schema.org Organization structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Glossy',
    url: BASE_URL,
    logo: `${BASE_URL}/GLOSSY/logo.png`,
    description: locale === 'ar'
      ? 'متجر مستحضرات التجميل الفاخرة في ليبيا'
      : 'Premium Beauty Store in Libya',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: [
      // Add your social media URLs here
    ],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Glossy',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/${locale}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800&family=Montserrat:wght@500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
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
          <AnalyticsScripts />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
