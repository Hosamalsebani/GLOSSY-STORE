import LoyaltyClient from '@/components/loyalty/LoyaltyClient';

export default async function LoyaltyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return <LoyaltyClient locale={locale} />;
}
