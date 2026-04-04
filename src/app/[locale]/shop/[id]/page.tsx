import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/shop/ProductDetailsClient';

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createClient();

  // 1. Check if ID is UUID or Slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let query = supabase.from('products').select('*');
  if (isUuid) {
    query = query.or(`id.eq.${id},slug.eq.${id}`);
  } else {
    query = query.eq('slug', id);
  }
  
  const { data: product, error } = await query.maybeSingle();
    
  if (error || !product) {
    notFound();
  }

  return (
    <ProductDetailsClient 
      product={product} 
      locale={locale} 
    />
  );
}
