'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, CheckCircle, Loader2, Save, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type BeautyTip = {
  id: string;
  image_url: string;
  video_url: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  created_at?: string;
};

export default function AdminBeautyTipsPage() {
  const t = useTranslations('Admin.tips');
  const [tips, setTips] = useState<BeautyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTip, setEditingTip] = useState<Partial<BeautyTip> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      console.log('AdminBeautyTipsPage: Fetching tips...');
      const { data, error } = await supabase
        .from('beauty_tips')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('AdminBeautyTipsPage: Supabase error:', error);
        throw error;
      }
      
      console.log('AdminBeautyTipsPage: Fetched tips count:', data?.length);
      setTips(data || []);
    } catch (error: any) {
      console.error('AdminBeautyTipsPage: Catch error:', error);
      // Log more details if it's a Supabase error
      if (error.message) {
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tip: BeautyTip) => {
    setEditingTip(tip);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingTip({
      title_en: '',
      title_ar: '',
      content_en: '',
      content_ar: '',
      image_url: '',
      video_url: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      const { error } = await supabase.from('beauty_tips').delete().eq('id', id);
      if (error) throw error;
      setTips(tips.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting tip:', error);
      alert('Failed to delete tip');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingTip(prev => prev ? { ...prev, image_url: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingTip?.title_en || !editingTip?.title_ar || !editingTip?.image_url) {
      alert('Please fill in all required fields and upload an image.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTip.id) {
        // Update
        const { error } = await supabase
          .from('beauty_tips')
          .update({
            title_en: editingTip.title_en,
            title_ar: editingTip.title_ar,
            content_en: editingTip.content_en,
            content_ar: editingTip.content_ar,
            image_url: editingTip.image_url,
            video_url: editingTip.video_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTip.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('beauty_tips')
          .insert([{
            title_en: editingTip.title_en,
            title_ar: editingTip.title_ar,
            content_en: editingTip.content_en,
            content_ar: editingTip.content_ar,
            image_url: editingTip.image_url,
            video_url: editingTip.video_url
          }]);
        if (error) throw error;
      }
      
      setShowForm(false);
      setEditingTip(null);
      fetchTips();
    } catch (error) {
      console.error('Error saving tip:', error);
      alert('Failed to save tip');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-[var(--color-luxury-black)]">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        {!showForm && (
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} /> {t('addPost')}
          </button>
        )}
      </div>

      {showForm && editingTip && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-serif text-lg">{editingTip.id ? t('editPost') : t('addPost')}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">{t('uploadImage')}</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative cursor-pointer hover:border-[var(--color-rose-gold)] hover:bg-[var(--color-rose-gold)]/5 transition-all group overflow-hidden"
                >
                  {editingTip.image_url ? (
                    <>
                      <img src={editingTip.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-white px-4 py-2 text-sm font-medium rounded shadow-sm text-gray-700">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-gray-300 group-hover:text-[var(--color-rose-gold)] mb-3" />
                      <span className="text-sm text-gray-400 group-hover:text-[var(--color-rose-gold)]">Click to upload photo</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
              </div>

              {/* Video URL Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Video URL (Optional - Reels Format)</label>
                <input 
                  type="text"
                  placeholder="Paste video URL here (mp4, youtube, etc.)"
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none"
                  value={editingTip.video_url || ''}
                  onChange={e => setEditingTip({...editingTip, video_url: e.target.value})}
                />
                <p className="text-[10px] text-gray-400">If a video URL is provided, it will be prioritized over the image in the feed.</p>
              </div>

              {/* Title & Content Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('titleEn')}</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none"
                      value={editingTip.title_en}
                      onChange={e => setEditingTip({...editingTip, title_en: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">{t('titleAr')}</label>
                    <input 
                      type="text"
                      dir="rtl"
                      className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none"
                      value={editingTip.title_ar}
                      onChange={e => setEditingTip({...editingTip, title_ar: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contentEn')}</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none resize-none"
                      value={editingTip.content_en}
                      onChange={e => setEditingTip({...editingTip, content_en: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">{t('contentAr')}</label>
                    <textarea 
                      dir="rtl"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none resize-none"
                      value={editingTip.content_ar}
                      onChange={e => setEditingTip({...editingTip, content_ar: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium shadow-sm"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {t('savePost')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip) => (
          <div key={tip.id} className="bg-white border border-gray-200 flex flex-col group overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              {tip.image_url && (
                <Image 
                  src={tip.image_url} 
                  alt={tip.title_en}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute top-2 right-2 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleEdit(tip)}
                  className="p-2 bg-white text-gray-700 shadow-lg hover:text-[var(--color-rose-gold)]"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(tip.id)}
                  className="p-2 bg-white text-red-500 shadow-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2 flex-grow">
              <h3 className="font-serif text-lg leading-tight line-clamp-1">{tip.title_ar}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{tip.content_ar}</p>
            </div>
            <div className="px-4 py-3 border-t border-gray-50 text-[10px] text-gray-400 uppercase tracking-widest flex justify-between">
              <span>{tip.title_en}</span>
              <span suppressHydrationWarning>
                {tip.created_at ? new Date(tip.created_at).toLocaleDateString() : ''}
              </span>
            </div>
          </div>
        ))}

        {tips.length === 0 && !showForm && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-sm">
            <p className="text-gray-400 font-serif italic">{t('noTips')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
