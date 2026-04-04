import { createClient } from '@/utils/supabase/server';
import ShopClient from '@/components/shop/ShopClient';

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ brand?: string }>;
}) {
  const { locale } = await params;
  const { brand: brandFilter } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('products').select('*');
  
  if (brandFilter) {
    query = query.ilike('brand', `%${brandFilter}%`);
  }

  const { data: products } = await query;

  return (
    <ShopClient 
      initialProducts={products || []} 
      brandFilter={brandFilter || null} 
      locale={locale} 
    />
  );
}
