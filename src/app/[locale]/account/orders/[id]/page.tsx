'use client';

import { useEffect, use } from 'react';
import { useRouter } from '@/i18n/routing';

export default function OrderDetailsRedirect({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main orders page. 
    // We could potentially pass the ID as a query param to auto-expand, 
    // but for now, a simple redirect to the list is cleaner.
    router.replace('/account/orders');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
    </div>
  );
}
