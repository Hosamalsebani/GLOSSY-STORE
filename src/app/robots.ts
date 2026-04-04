import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = 'https://glossy-store-stnz.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/checkout/', '/cart/', '/account/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
