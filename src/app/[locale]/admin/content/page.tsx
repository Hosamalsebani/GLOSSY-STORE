'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, CheckCircle, Eye, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

type Slide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
};

export default function AdminContentPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewSlide, setCurrentPreviewSlide] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('sliders')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setSlides(data.map(s => ({
          id: s.id,
          image: s.image_url,
          title: s.title,
          subtitle: s.subtitle || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(), // Temp ID for the frontend UI
      image: '',
      title: 'New Slide Title',
      subtitle: 'New slide subtitle goes here.',
    };
    setSlides([...slides, newSlide]);
  };

  const handleRemoveSlide = (id: string) => {
    setSlides(slides.filter((slide) => slide.id !== id));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSlides = [...slides];
      [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
      setSlides(newSlides);
    } else if (direction === 'down' && index < slides.length - 1) {
      const newSlides = [...slides];
      [newSlides[index + 1], newSlides[index]] = [newSlides[index], newSlides[index + 1]];
      setSlides(newSlides);
    }
  };

  const handleChange = (id: string, field: keyof Slide, value: string) => {
    setSlides(
      slides.map((slide) =>
        slide.id === id ? { ...slide, [field]: value } : slide
      )
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingSlideId) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        handleChange(editingSlideId, 'image', reader.result as string);
        setEditingSlideId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = (id: string) => {
    setEditingSlideId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // 1. Validation: Ensure all slides have images
      const missingImages = slides.some(s => !s.image);
      if (missingImages) {
        alert('All slides must have an image before saving.');
        setIsSaving(false);
        return;
      }

      // 2. Clear existing slides
      // Better to use a specific delete or handle the response
      const { error: deleteError } = await supabase.from('sliders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to clear existing slides: ${deleteError.message}`);
      }
      
      // 3. Insert new slides
      const toInsert = slides.map((s, index) => ({
        image_url: s.image,
        title: s.title,
        subtitle: s.subtitle,
        sort_order: index
      }));
      
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('sliders').insert(toInsert);
        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Failed to insert slides: ${insertError.message}`);
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchSlides();
    } catch (error: any) {
      console.error('Full save error details:', error);
      const errorMessage = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      
      if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        alert('Database missing: The sliders table does not exist yet. Please run the SQL migrations in Supabase.');
      } else {
        alert(`Error saving slides: ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="animate-spin w-8 h-8 opacity-50" />
          <p className="uppercase tracking-widest text-sm">Loading Homepage Content...</p>
        </div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif text-[var(--color-luxury-black)]">Homepage Preview</h2>
          <button 
            type="button"
            title="Exit Preview"
            onClick={() => setPreviewMode(false)}
            className="px-6 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 transition-colors"
          >
            Exit Preview
          </button>
        </div>

        {slides.length === 0 ? (
          <div className="bg-white p-12 text-center border border-gray-200">
            <h3 className="text-lg text-gray-400 font-medium mb-2">No slides to preview</h3>
            <p className="text-sm text-gray-500">Go back and add some slides to see the preview.</p>
          </div>
        ) : (
          <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden bg-[var(--color-luxury-black)] border border-gray-200">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPreviewSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img 
                  className="absolute inset-0 w-full h-full object-cover"
                  src={slides[currentPreviewSlide]?.image || 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=2000'}
                  alt={slides[currentPreviewSlide]?.title || 'Slide Preview'}
                />
                <div className="absolute inset-0 bg-black/40" />
              </motion.div>
            </AnimatePresence>

            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPreviewSlide}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl"
                >
                  <span className="text-sm uppercase tracking-[0.3em] font-medium mb-4 block text-[var(--color-rose-gold)]">
                    Welcome to Glossy
                  </span>
                  <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                    {slides[currentPreviewSlide]?.title}
                  </h1>
                  <p className="text-lg font-light mb-10 text-gray-200">
                    {slides[currentPreviewSlide]?.subtitle}
                  </p>
                  <div className="inline-block px-8 py-3 bg-white text-[var(--color-luxury-black)] font-medium tracking-widest uppercase">
                    Explore Collection
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  title={`Slide ${index + 1}`}
                  onClick={() => setCurrentPreviewSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentPreviewSlide 
                      ? 'w-10 h-1 bg-white' 
                      : 'w-5 h-1 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        title="Upload Image"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-2">Homepage Slider</h1>
          <p className="text-gray-500">Manage the moving carousel images on your storefront.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            type="button"
            title="Preview Slider"
            onClick={() => setPreviewMode(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white font-medium"
          >
            <Eye size={18} /> Preview
          </button>
          <button 
            type="button"
            title="Save Changes"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : saveSuccess ? <><CheckCircle size={18} /> Saved</> : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row gap-6 items-start">
            
            <div className="w-full md:w-1/3 aspect-[16/9] bg-gray-50 border border-gray-100 flex-shrink-0 relative group rounded-sm overflow-hidden">
              {slide.image ? (
                <>
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      title="Change Image"
                      onClick={() => triggerImageUpload(slide.id)}
                      className="bg-white text-[var(--color-luxury-black)] px-4 py-2 font-medium text-sm rounded shadow-sm hover:bg-gray-100"
                    >
                      Change Image
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => triggerImageUpload(slide.id)}
                  title="Upload Image"
                  className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-[var(--color-rose-gold)] hover:bg-[var(--color-rose-gold)]/5 cursor-pointer transition-colors"
                >
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-sm font-medium">Upload Image</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-4 w-full">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-500 uppercase tracking-widest text-xs">Slide {index + 1}</h3>
                
                <div className="flex items-center gap-2 border border-gray-200 rounded-md p-1 bg-gray-50">
                  <button 
                    type="button"
                    onClick={() => handleMoveSlide(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:bg-white hover:text-[var(--color-luxury-black)] rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleMoveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-1 text-gray-500 hover:bg-white hover:text-[var(--color-luxury-black)] rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded"
                    title="Delete Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor={`headline-${slide.id}`} className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input 
                  id={`headline-${slide.id}`}
                  type="text" 
                  value={slide.title}
                  title="Headline"
                  onChange={(e) => handleChange(slide.id, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-transparent outline-none transition-shadow"
                />
              </div>

              <div>
                <label htmlFor={`subheading-${slide.id}`} className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                <textarea 
                  id={`subheading-${slide.id}`}
                  rows={2}
                  value={slide.subtitle}
                  title="Subheading"
                  onChange={(e) => handleChange(slide.id, 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-transparent outline-none transition-shadow resize-none"
                />
              </div>
            </div>

          </div>
        ))}
      </div>

      <button 
        type="button"
        title="Add New Slide"
        onClick={handleAddSlide}
        className="w-full py-6 border-2 border-dashed border-gray-300 text-gray-500 hover:border-[var(--color-rose-gold)] hover:text-[var(--color-rose-gold)] hover:bg-[var(--color-rose-gold)]/5 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Add New Slide
      </button>

      <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-sm text-sm text-blue-800 flex items-start gap-3 mt-8">
        <div className="mt-0.5">ℹ️</div>
        <div>
          <p className="font-medium mb-1">Pro Tips for Luxury Slides</p>
          <ul className="list-disc pl-4 space-y-1 text-blue-700/80">
            <li>Use high-resolution images (recommended 2000x1200px or higher)</li>
            <li>Darker imagery works best to let the white text stand out</li>
            <li>Keep headlines under 5 words for maximum impact</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
