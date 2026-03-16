'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations, useLocale } from 'next-intl';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '@/utils/video';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type BeautyTip = {
  id: string;
  image_url: string;
  video_url?: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  created_at: string;
  likes_count: number;
  share_count: number;
  comments_count: number;
  is_liked?: boolean;
};

export default function BeautyTipsPage() {
  const t = useTranslations('Tips');
  const locale = useLocale();
  const [tips, setTips] = useState<BeautyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      console.log('BeautyTipsPage: Fetching tips...');
      const { data, error } = await supabase
        .from('beauty_tips')
        .select(`
          *,
          tip_likes:tip_likes(count),
          tip_comments:tip_comments(count)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('BeautyTipsPage: Supabase error:', error);
        throw error;
      }
      
      console.log('BeautyTipsPage: Raw data:', data);
      
      const formattedTips = data.map((tip: any) => ({
        ...tip,
        likes_count: tip.tip_likes?.[0]?.count || 0,
        comments_count: tip.tip_comments?.[0]?.count || 0
      }));
      
      console.log('BeautyTipsPage: Formatted tips count:', formattedTips.length);
      setTips(formattedTips);
    } catch (error: any) {
      console.error('BeautyTipsPage: Catch block error:', error);
      if (error.message) {
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert(t('loginPrompt'));
      return;
    }

    // Optimistic UI could be here
    try {
      const tip = tips.find(t => t.id === id);
      if (tip?.is_liked) {
        await supabase.from('tip_likes').delete().match({ tip_id: id, user_id: user.id });
      } else {
        await supabase.from('tip_likes').insert({ tip_id: id, user_id: user.id });
      }
      fetchTips(); // Refresh to get correct counts and state
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-rose-gold)]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--color-rose-gold)] font-medium tracking-[0.2em] uppercase text-xs"
          >
            {t('subheading')}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-[var(--color-luxury-black)]"
          >
            {t('heading')}
          </motion.h1>
          <div className="w-20 h-[1px] bg-[var(--color-rose-gold)] mx-auto mt-6"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-8">
        {tips.map((tip, index) => (
          <motion.article 
            key={tip.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-rose-gold)] to-pink-200 flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
                G
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-sm text-gray-900">Glamour & Glow Admin</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider" suppressHydrationWarning>
                  {new Date(tip.created_at).toLocaleDateString()}
                </p>
              </div>
              <Share2 
                size={18} 
                className="text-gray-400 cursor-pointer hover:text-[var(--color-rose-gold)]" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const url = window.location.origin + `/${locale}/tips/${tip.id}`;
                  if (navigator.share) {
                    navigator.share({
                      title: locale === 'ar' ? tip.title_ar : tip.title_en,
                      text: t('shareText'),
                      url: url
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert(t('linkCopied'));
                  }
                }}
              />
            </div>

            {/* Post Media (Image or Video) */}
            <div className="block aspect-[4/5] relative bg-gray-100 overflow-hidden">
              {tip.video_url ? (
                isYouTubeUrl(tip.video_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(tip.video_url) || ''}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={locale === 'ar' ? tip.title_ar : tip.title_en}
                  />
                ) : (
                  <video 
                    src={tip.video_url} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <Link href={`/${locale}/tips/${tip.id}`} className="block w-full h-full relative">
                  <Image 
                    src={tip.image_url} 
                    alt={locale === 'ar' ? tip.title_ar : tip.title_en}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </Link>
              )}
              
              {tip.video_url && (
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-1.5 rounded-full">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-6">
                <button 
                  onClick={(e) => handleLike(tip.id, e)}
                  className={`flex items-center gap-1.5 transition-colors ${tip.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                >
                  <Heart size={22} fill={tip.is_liked ? "currentColor" : "none"} />
                  <span className="text-sm font-medium">{tip.likes_count}</span>
                </button>
                <Link href={`/${locale}/tips/${tip.id}`} className="flex items-center gap-1.5 text-gray-600 hover:text-[var(--color-rose-gold)] transition-colors">
                  <MessageSquare size={22} />
                  <span className="text-sm font-medium">{tip.comments_count}</span>
                </Link>
                <button 
                  onClick={() => {
                    const url = window.location.origin + `/${locale}/tips/${tip.id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: locale === 'ar' ? tip.title_ar : tip.title_en,
                        text: t('shareText'),
                        url: url
                      });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert(t('linkCopied'));
                    }
                  }}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-[var(--color-rose-gold)] transition-colors ml-auto"
                >
                  <Share2 size={22} />
                </button>
              </div>

              <div className="space-y-2">
                <Link href={`/${locale}/tips/${tip.id}`}>
                  <h2 className={`text-xl font-serif text-gray-900 hover:text-[var(--color-rose-gold)] transition-colors ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? tip.title_ar : tip.title_en}
                  </h2>
                </Link>
                <p className={`text-gray-600 leading-relaxed line-clamp-3 text-sm ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  {locale === 'ar' ? tip.content_ar : tip.content_en}
                </p>
              </div>

              <Link 
                href={`/${locale}/tips/${tip.id}`}
                className={`flex items-center gap-1 text-[var(--color-rose-gold)] text-sm font-medium hover:underline ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
              >
                {t('readMore')} <ChevronRight size={16} className={locale === 'ar' ? 'rotate-180' : ''} />
              </Link>
            </div>
          </motion.article>
        ))}

        {tips.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-400 font-serif italic">{t('noTips')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
