'use client';

import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Loader2, X, Send, User as UserIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    full_name: string;
  };
};

interface TipsClientProps {
  initialTips: BeautyTip[];
  locale: string;
  translations: {
    loginPrompt: string;
    linkCopied: string;
  };
}

export default function TipsClient({ initialTips, locale, translations }: TipsClientProps) {
  const [tips, setTips] = useState<BeautyTip[]>(initialTips);
  const [activeTipId, setActiveTipId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const supabase = createClient();
  const isRtl = locale === 'ar';

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert(translations.loginPrompt);

    setTips(prev => prev.map(t => {
      if (t.id === id) {
        const newIsLiked = !t.is_liked;
        return {
          ...t,
          is_liked: newIsLiked,
          likes_count: newIsLiked ? t.likes_count + 1 : Math.max(0, t.likes_count - 1)
        };
      }
      return t;
    }));

    try {
      const tip = tips.find(t => t.id === id);
      if (tip?.is_liked) {
        await supabase.from('tip_likes').delete().match({ tip_id: id, user_id: user.id });
      } else {
        await supabase.from('tip_likes').insert({ tip_id: id, user_id: user.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async (tip: BeautyTip) => {
    const url = `${window.location.origin}/${locale}/tips/${tip.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: isRtl ? tip.title_ar : tip.title_en,
          text: isRtl ? tip.content_ar : tip.content_en,
          url: url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert(translations.linkCopied);
    }
  };

  const openComments = async (id: string) => {
    setActiveTipId(id);
    setIsDrawerOpen(true);
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('tip_comments')
        .select(`
          id, content, created_at, user_id,
          users:user_id(full_name)
        `)
        .eq('tip_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data as any || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeTipId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert(translations.loginPrompt);

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('tip_comments')
        .insert({
          tip_id: activeTipId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;
      setNewComment('');
      
      const { data: updatedComments } = await supabase
        .from('tip_comments')
        .select(`
          id, content, created_at, user_id,
          users:user_id(full_name)
        `)
        .eq('tip_id', activeTipId)
        .order('created_at', { ascending: false });
      
      setComments(updatedComments as any || []);
      
      setTips(prev => prev.map(t => {
         if (t.id === activeTipId) return { ...t, comments_count: t.comments_count + 1 };
         return t;
      }));
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Helper for YouTube
  const isYouTubeUrl = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="min-h-screen bg-gray-200 pb-20">
      <div className="max-w-[680px] mx-auto sm:py-4 space-y-3">
        {tips.map((tip) => (
          <motion.article 
            key={tip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white sm:rounded-lg shadow-sm border-y sm:border border-gray-100"
          >
            {/* Post Header */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-50 overflow-hidden relative border border-gray-100">
                  <Image src="/images/logo.png" alt="Glossy" fill className="object-contain p-1.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-gray-900">Glossy Beauty</span>
                  <div className="flex items-center gap-1 text-gray-500 text-[13px]">
                    <span suppressHydrationWarning>
                      {new Date(tip.created_at).toLocaleDateString(isRtl ? 'ar-LY' : 'en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <MoreHorizontal size={20} className="text-gray-500 cursor-pointer p-1 hover:bg-gray-100 rounded-full" />
            </div>

            {/* Post Text */}
            <div className="px-4 pb-3">
               <p className={`text-[15px] text-gray-800 leading-[1.4] ${isRtl ? 'text-right' : 'text-left'}`}>
                 {isRtl ? tip.content_ar : tip.content_en}
               </p>
            </div>

            {/* Post Media */}
            <div className="relative aspect-square sm:aspect-video bg-gray-50 border-y border-gray-50 overflow-hidden">
               {tip.video_url ? (
                  isYouTubeUrl(tip.video_url) ? (
                    <iframe src={getYouTubeEmbedUrl(tip.video_url) || undefined} title={isRtl ? tip.title_ar : tip.title_en} className="w-full h-full object-cover" allowFullScreen />
                  ) : (
                    <video src={tip.video_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                  )
                ) : (
                  <Image src={tip.image_url} alt={isRtl ? tip.title_ar : tip.title_en} fill className="object-contain sm:object-cover" />
                )}
            </div>

            {/* Summary */}
            <div className="px-4 py-2 flex justify-between items-center text-gray-500 text-[14px]">
               <div className="flex items-center gap-1.5">
                  <div className="w-4.5 h-4.5 bg-[#0866FF] rounded-full flex items-center justify-center p-0.5 z-10">
                    <ThumbsUp size={10} className="text-white fill-white" />
                  </div>
                  <span>{tip.likes_count}</span>
               </div>
               <span>{tip.comments_count} {isRtl ? 'تعليق' : 'comments'}</span>
            </div>

            {/* Action Bar */}
            <div className="px-3 border-t border-gray-100">
               <div className="flex items-center justify-between py-1">
                 <button 
                   onClick={(e) => handleLike(tip.id, e)}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50 transition-colors ${tip.is_liked ? 'text-[#0866FF]' : 'text-gray-600'}`}
                 >
                   <ThumbsUp size={18} fill={tip.is_liked ? "currentColor" : "none"} />
                   <span className="text-[14px] font-semibold">{isRtl ? 'أعجبني' : 'Like'}</span>
                 </button>
                 <button 
                    onClick={() => openComments(tip.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50 transition-colors text-gray-600"
                 >
                   <MessageCircle size={18} />
                   <span className="text-[14px] font-semibold">{isRtl ? 'تعليق' : 'Comment'}</span>
                 </button>
                 <button 
                  onClick={() => handleShare(tip)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50 transition-colors text-gray-600"
                 >
                   <Share2 size={18} />
                   <span className="text-[14px] font-semibold">{isRtl ? 'مشاركة' : 'Share'}</span>
                 </button>
               </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Facebook-style Comments Bottom Sheet */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white z-[110] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                 <div className="w-10 h-1 text-gray-200 bg-gray-200 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
                 <h3 className="font-semibold text-gray-900 w-full text-center mt-2">{isRtl ? 'التعليقات' : 'Comments'}</h3>
                 <button onClick={() => setIsDrawerOpen(false)} className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} className="text-gray-500" />
                 </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                 {loadingComments ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-300" /></div>
                 ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <UserIcon size={16} className="text-white" />
                         </div>
                         <div className={`p-3 bg-gray-200 rounded-2xl max-w-[85%] ${isRtl ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                            <p className="text-[13px] font-bold text-gray-900">{comment.users?.full_name || 'Guest User'}</p>
                            <p className="text-sm text-gray-800 leading-[1.3]">{comment.content}</p>
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-20 text-gray-400 text-sm italic">{isRtl ? 'لا توجد تعليقات بعد' : 'No comments yet'}</div>
                 )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-white pb-6 sm:pb-4">
                 <form onSubmit={postComment} className={`flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                   <input 
                    type="text" 
                    placeholder={isRtl ? 'اكتب تعليقاً...' : 'Write a comment...'}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-gray-800 py-1"
                    dir={isRtl ? 'rtl' : 'ltr'}
                   />
                   <button 
                    type="submit" 
                    disabled={!newComment.trim() || submittingComment}
                    className="text-[#0866FF] disabled:text-gray-300 transition-colors"
                   >
                     {submittingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} className={isRtl ? 'rotate-180' : ''} />}
                   </button>
                 </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
