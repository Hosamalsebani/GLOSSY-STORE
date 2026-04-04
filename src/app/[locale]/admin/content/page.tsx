'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, CheckCircle, Eye, Loader2, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

type Slide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  placement: string;
};

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('home');
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
    fetchSlides(activeTab);
  }, [activeTab]);

  const fetchSlides = async (placement: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sliders')
        .select('*')
        .eq('placement', placement)
        .order('sort_order', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setSlides(data.map(s => ({
          id: s.id,
          image: s.image_url,
          title: s.title,
          subtitle: s.subtitle || '',
          placement: s.placement
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
      id: crypto.randomUUID(),
      image: '',
      title: (activeTab === 'lenses-banner' || activeTab === 'promo-squares') ? '' : 'New Slide',
      subtitle: '',
      placement: activeTab
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
      const missingImages = slides.some(s => !s.image);
      if (missingImages) {
        alert('All slides must have an image before saving.');
        setIsSaving(false);
        return;
      }

      // Clear existing for this placement
      const { error: deleteError } = await supabase
        .from('sliders')
        .delete()
        .eq('placement', activeTab);
        
      if (deleteError) {
        throw new Error(`Failed to clear existing slides: ${deleteError.message}`);
      }
      
      const toInsert = slides.map((s, index) => ({
        image_url: s.image,
        title: s.title,
        subtitle: s.subtitle,
        sort_order: index,
        placement: activeTab
      }));
      
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('sliders').insert(toInsert);
        if (insertError) {
          throw new Error(`Failed to insert slides: ${insertError.message}`);
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchSlides(activeTab);
    } catch (error: any) {
      console.error('Save error details:', error);
      alert(`Error saving slides: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif text-[var(--color-luxury-black)]">Preview</h2>
          <button 
            type="button"
            onClick={() => setPreviewMode(false)}
            className="px-6 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 transition-colors"
          >
            Exit Preview
          </button>
        </div>

        {slides.length === 0 ? (
          <div className="bg-white p-12 text-center border border-gray-200">
            <p className="text-sm text-gray-500">No slides to preview.</p>
          </div>
        ) : (
          <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden bg-[var(--color-luxury-black)] border border-gray-200 rounded-lg">
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
                  className="absolute inset-0 w-full h-full object-cover text-center"
                  src={slides[currentPreviewSlide]?.image}
                  alt={slides[currentPreviewSlide]?.title}
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
                  <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">
                    {slides[currentPreviewSlide]?.title}
                  </h1>
                  <p className="text-lg font-light mb-8 text-gray-200">
                    {slides[currentPreviewSlide]?.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
              {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    title={`Go to slide ${index + 1}`}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-2 flex items-center gap-2">
            <Layout size={24} /> Banners & Sliders Console
          </h1>
          <p className="text-gray-500">Control promotional visuals and hero banners across your entire storefront.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button 
            type="button"
            title="Preview Slider"
            onClick={() => setPreviewMode(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white font-medium shadow-sm"
          >
            <Eye size={18} /> Preview
          </button>
          <button 
            type="button"
            title="Save Changes"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 shadow-xl"
          >
            {isSaving ? 'Saving...' : saveSuccess ? <><CheckCircle size={18} /> Saved</> : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 md:gap-4 overflow-x-auto border-b border-gray-200 font-medium text-sm">
        <button 
          onClick={() => setActiveTab('home')}
          className={`py-3 px-2 md:px-6 uppercase tracking-widest whitespace-nowrap outline-none transition-colors ${activeTab === 'home' ? 'border-b-2 border-[var(--color-luxury-black)] text-[var(--color-luxury-black)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Main Homepage Slider
        </button>
        <button 
          onClick={() => setActiveTab('lenses-banner')}
          className={`py-3 px-2 md:px-6 uppercase tracking-widest whitespace-nowrap outline-none transition-colors ${activeTab === 'lenses-banner' ? 'border-b-2 border-[var(--color-luxury-black)] text-[var(--color-luxury-black)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Lenses Mini Banner
        </button>
        <button 
          onClick={() => setActiveTab('lenses-slider')}
          className={`py-3 px-2 md:px-6 uppercase tracking-widest whitespace-nowrap outline-none transition-colors ${activeTab === 'lenses-slider' ? 'border-b-2 border-[var(--color-luxury-black)] text-[var(--color-luxury-black)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Lenses Dept. Slider
        </button>
        <button 
          onClick={() => setActiveTab('promo-squares')}
          className={`py-3 px-2 md:px-6 uppercase tracking-widest whitespace-nowrap outline-none transition-colors ${activeTab === 'promo-squares' ? 'border-b-2 border-[var(--color-luxury-black)] text-[var(--color-luxury-black)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Promo Squares
        </button>
        <button 
          onClick={() => setActiveTab('perfume-banner')}
          className={`py-3 px-2 md:px-6 uppercase tracking-widest whitespace-nowrap outline-none transition-colors ${activeTab === 'perfume-banner' ? 'border-b-2 border-[var(--color-luxury-black)] text-[var(--color-luxury-black)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Perfume Banner
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8 opacity-50" />
        </div>
      ) : (
        <div className="space-y-6">
          {slides.length === 0 && (
             <div className="text-center py-10 bg-gray-50 border border-gray-200 border-dashed">
               <p className="text-gray-400 uppercase tracking-widest text-sm mb-4">No content for this placement</p>
             </div>
          )}

          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-full w-1 bg-gray-100 group-hover:bg-[var(--color-rose-gold)] transition-colors"></div>
              
              <div className="w-full md:w-1/3 aspect-[16/9] bg-gray-50 border border-gray-100 flex-shrink-0 relative rounded-sm overflow-hidden group/img">
                {slide.image ? (
                  <>
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    {activeTab === 'home' && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); triggerImageUpload(slide.id); }}
                          className="bg-white text-[var(--color-luxury-black)] px-4 py-2 font-medium text-sm rounded shadow-sm hover:bg-gray-100"
                        >
                          Change Image
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div 
                    onClick={() => activeTab === 'home' && triggerImageUpload(slide.id)}
                    className={`w-full h-full flex flex-col items-center justify-center text-gray-400 ${activeTab === 'home' ? 'hover:text-[var(--color-rose-gold)] hover:bg-[var(--color-rose-gold)]/5 cursor-pointer' : ''} transition-colors`}
                  >
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-sm font-medium">{activeTab === 'home' ? 'Click to Add Media' : 'No Image Set'}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-400 uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-4 h-4 bg-gray-800 text-white rounded-full flex items-center justify-center">{index + 1}</span> {activeTab.replace('-', ' ')}
                  </h3>
                  
                  <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1 bg-gray-50 shadow-sm">
                    <button 
                      type="button"
                      title="Move Up"
                      onClick={() => handleMoveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-500 hover:bg-white hover:text-[var(--color-luxury-black)] rounded disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      type="button"
                      title="Move Down"
                      onClick={() => handleMoveSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-1.5 text-gray-500 hover:bg-white hover:text-[var(--color-luxury-black)] rounded disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <button 
                      type="button"
                      title="Delete Slide"
                      onClick={() => handleRemoveSlide(slide.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {activeTab === 'promo-squares' ? (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Label (Arabic) — الاسم بالعربية</label>
                        <input 
                          type="text" 
                          placeholder="مثال: الأم والطفل"
                          title="Arabic label for this square"
                          value={slide.title}
                          onChange={(e) => handleChange(slide.id, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Link URL — رابط القسم</label>
                        <input 
                          type="text" 
                          placeholder="/category/mother-and-child"
                          title="Link URL for this square"
                          value={slide.subtitle}
                          onChange={(e) => handleChange(slide.id, 'subtitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none text-sm font-mono text-xs"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 italic">Upload a square image above. The label will appear as an overlay on the homepage.</p>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Overlay Title (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="Leave completely empty if you only want the image to show."
                          title="Overlay title text"
                          value={slide.title}
                          onChange={(e) => handleChange(slide.id, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none text-sm"
                        />
                      </div>

                      {activeTab !== 'lenses-banner' && (
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Subheading / Description</label>
                          <textarea 
                            rows={2}
                            title="Subheading text"
                            value={slide.subtitle}
                            onChange={(e) => handleChange(slide.id, 'subtitle', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] outline-none resize-none text-sm"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {(!loading && activeTab === 'home') && (
         <button 
           type="button"
           onClick={handleAddSlide}
           className="w-full py-6 border-2 border-dashed border-gray-300 text-gray-500 hover:border-[var(--color-luxury-black)] hover:text-[var(--color-luxury-black)] transition-all font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2"
         >
           <Plus size={18} /> Add New Slide
         </button>
      )}
    </div>
  );
}
