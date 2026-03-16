'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations, useLocale } from 'next-intl';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '@/utils/video';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    full_name: string;
  };
};

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
  is_liked?: boolean;
};

export default function TipDetailPage() {
  const t = useTranslations('Tips');
  const locale = useLocale();
  const params = useParams();
  const id = params.id as string;
  const [tip, setTip] = useState<BeautyTip | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchTipAndComments();
  }, [id]);

  const fetchTipAndComments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('TipDetailPage: Fetching tip and comments for ID:', id);
      const { data: tipData, error: tipError } = await supabase
        .from('beauty_tips')
        .select(`
          *,
          tip_likes:tip_likes(count)
        `)
        .eq('id', id)
        .single();
        
      if (tipError) {
        console.error('TipDetailPage: Tip fetch error:', tipError);
        throw tipError;
      }
      
      let isLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from('tip_likes')
          .select('tip_id')
          .match({ tip_id: id, user_id: user.id })
          .maybeSingle();
        isLiked = !!likeData;
      }

      const { data: commentsData, error: commentsError } = await supabase
        .from('tip_comments')
        .select(`
          id, content, created_at, user_id,
          users:user_id(full_name)
        `)
        .eq('tip_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('TipDetailPage: Comments fetch error:', commentsError);
        throw commentsError;
      }

      console.log('TipDetailPage: Raw tip data:', tipData);
      console.log('TipDetailPage: Comments count:', commentsData?.length);

      setTip({
        ...tipData,
        likes_count: tipData.tip_likes?.[0]?.count || 0,
        is_liked: isLiked
      });
      setComments(commentsData as any || []);
    } catch (error: any) {
      console.error('TipDetailPage: Catch error:', error);
      if (error.message) {
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert(t('loginPrompt'));
      return;
    }

    try {
      if (tip?.is_liked) {
        await supabase.from('tip_likes').delete().match({ tip_id: id, user_id: user.id });
      } else {
        await supabase.from('tip_likes').insert({ tip_id: id, user_id: user.id });
      }
      fetchTipAndComments();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert(t('loginPrompt'));
      return;
    }

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('tip_comments')
        .insert({
          tip_id: id,
          user_id: user.id,
          content: newComment.trim()
        });
        
      if (error) throw error;
      setNewComment('');
      fetchTipAndComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-rose-gold)]" size={40} />
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-2xl font-serif text-gray-400 italic">Tip not found</h1>
        <Link href={`/${locale}/tips`} className="text-[var(--color-rose-gold)] mt-4 inline-block hover:underline">
          Back to all tips
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link 
          href={`/${locale}/tips`} 
          className={`inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-rose-gold)] transition-colors mb-8 group ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft size={18} className={`group-hover:-translate-x-1 transition-transform ${locale === 'ar' ? 'rotate-180' : ''}`} />
          <span className="text-sm font-medium">{t('backToTips')}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Post Media Container */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[4/5] relative rounded-lg overflow-hidden shadow-2xl bg-gray-50"
          >
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
                  controls
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <Image 
                src={tip.image_url} 
                alt={locale === 'ar' ? tip.title_ar : tip.title_en}
                fill
                priority
                className="object-cover"
              />
            )}
          </motion.div>

          {/* Content & Social Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <div className={`space-y-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="space-y-2">
                <span className="text-[var(--color-rose-gold)] font-medium tracking-widest uppercase text-xs" suppressHydrationWarning>
                  {new Date(tip.created_at).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-luxury-black)] leading-tight">
                  {locale === 'ar' ? tip.title_ar : tip.title_en}
                </h1>
              </div>

              <p className="text-gray-600 leading-relaxed text-lg italic font-light">
                {locale === 'ar' ? tip.content_ar : tip.content_en}
              </p>

              <div className={`flex items-center gap-6 pt-4 border-t border-gray-100 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${tip.is_liked ? 'bg-red-50 border-red-100 text-red-500 scale-105' : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'}`}
                >
                  <Heart size={20} fill={tip.is_liked ? "currentColor" : "none"} />
                  <span className="font-medium">{t('likes', { count: Number(tip.likes_count || 0) })}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare size={20} />
                  <span className="font-medium">{t('comments', { count: Number(comments.length || 0) })}</span>
                </div>
                <button 
                  onClick={() => {
                    const url = window.location.href;
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
                  className="flex items-center gap-2 p-2 text-gray-400 cursor-pointer hover:text-[var(--color-rose-gold)] ml-auto"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* Comments Section */}
              <div className="pt-8 space-y-6 flex-grow">
                <h3 className={`font-serif text-xl border-b border-gray-100 pb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('comments', { count: comments.length })}
                </h3>
                
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {comments.map((comment) => (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <div className={`bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-grow ${locale === 'ar' ? 'rounded-tl-2xl rounded-tr-none' : ''}`}>
                          <div className={`flex justify-between items-baseline mb-1 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-bold text-gray-900">{comment.users?.full_name || 'Guest User'}</span>
                            <span className="text-[10px] text-gray-400" suppressHydrationWarning>{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className={`text-sm text-gray-700 leading-snug ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                            {comment.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {comments.length === 0 && (
                    <p className="text-center text-gray-400 italic text-sm py-4">{t('noComments')}</p>
                  )}
                </div>

                {/* Post Comment Input */}
                <form onSubmit={handlePostComment} className={`relative flex items-center gap-2 pt-4 border-t border-gray-100 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <input 
                    type="text"
                    placeholder={t('commentPlaceholder')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    className="flex-grow px-4 py-3 bg-gray-50 border-none rounded-full text-sm focus:ring-1 focus:ring-[var(--color-rose-gold)] outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="p-3 bg-[var(--color-rose-gold)] text-white rounded-full hover:bg-[var(--color-rose-gold)]/90 disabled:bg-gray-200 transition-all flex-shrink-0"
                  >
                    {submittingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={locale === 'ar' ? 'rotate-180' : ''} />}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
