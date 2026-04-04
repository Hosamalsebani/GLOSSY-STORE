import type { MetadataRoute } from 'next';

const BASE_URL = 'https://glossy-store-stnz.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['ar', 'en'];

  // Static pages
  const staticPages = [
    '',
    '/shop',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/shipping',
    '/tips',
    '/mystery-boxes',
    '/offers/weekend',
  ];

  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'daily' as const : 'weekly' as const,
      priority: page === '' ? 1.0 : 0.8,
    }))
  );

  // Try to fetch product slugs from Supabase for dynamic product pages
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .limit(500);

    if (products) {
      productEntries = locales.flatMap((locale) =>
        products.map((product) => ({
          url: `${BASE_URL}/${locale}/shop/${product.id}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      );
    }
  } catch {
    // Silently fail if DB not available during build
  }

  // Fetch categories
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: categories } = await supabase
      .from('categories')
      .select('slug');

    if (categories) {
      categoryEntries = locales.flatMap((locale) =>
        categories.map((cat) => ({
          url: `${BASE_URL}/${locale}/category/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      );
    }
  } catch {
    // Silently fail
  }

  return [...staticEntries, ...productEntries, ...categoryEntries];
}
