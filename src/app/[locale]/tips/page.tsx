import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import TipsClient from '@/components/tips/TipsClient';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function TipsPayload({ locale, t }: { locale: string; t: any }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('beauty_tips')
    .select(`
      *,
      tip_likes:tip_likes(count),
      tip_comments:tip_comments(count)
    `)
    .is('category_id', null)
    .order('created_at', { ascending: false });

  const initialTips = (data || []).map((tip: any) => ({
    ...tip,
    likes_count: tip.tip_likes?.[0]?.count || 0,
    comments_count: tip.tip_comments?.[0]?.count || 0,
    is_liked: false, // Will be hydrated on client if user is logged in
  }));

  return (
    <TipsClient 
      initialTips={initialTips} 
      locale={locale}
      translations={{
        loginPrompt: t('loginToInteract'),
        linkCopied: t('linkCopied'),
      }}
    />
  );
}

export default async function BeautyTipsPage() {
  const t = await getTranslations('Tips');
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-gray-200">
      <Suspense 
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-[#E23049]" size={32} />
          </div>
        }
      >
        <TipsPayload locale={locale} t={t} />
      </Suspense>
    </div>
  );
}
