'use client';

import { useState } from 'react';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';

export default function AddMysteryBoxPage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    let imageUrl: string | null = null;

    // Upload image to Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `mystery-boxes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Failed to upload image.');
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }
    
    const newBox = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      image_url: imageUrl
    };

    const { error } = await supabase.from('mystery_boxes').insert([newBox]);

    setLoading(false);

    if (error) {
      console.error('Error inserting mystery box:', error);
      alert('Failed to add mystery box.');
    } else {
      router.push('/admin/mystery-boxes');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
         <Link href="/admin/mystery-boxes" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
           <ArrowLeft size={20} />
         </Link>
         <h1 className="text-3xl font-serif text-[var(--color-luxury-black)]">Add Mystery Box</h1>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <h2 className="text-lg font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-2">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Box Name *</label>
              <input name="name" type="text" required placeholder="Box Name" title="Box Name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input name="price" type="number" step="0.01" min="0" required placeholder="Price" title="Price" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows={4} placeholder="Description" title="Description" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <h2 className="text-lg font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-2">Box Image</h2>
          
          {previewUrl && (
            <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
              <div className="relative w-24 h-24 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => removeImage()} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100">
                  <X size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}

          <label className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center block">
             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             <Upload className="h-10 w-10 text-gray-400 mb-3" />
             <p className="text-sm font-medium text-[var(--color-luxury-black)]">Click to upload image</p>
          </label>
        </div>

        <div className="flex justify-end gap-4 pt-4">
           <Link href="/admin/mystery-boxes" className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md text-sm font-medium uppercase tracking-widest">
             Cancel
           </Link>
           <button type="submit" disabled={loading} className="px-6 py-3 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors rounded-md text-sm font-medium uppercase tracking-widest flex items-center gap-2 disabled:bg-gray-400">
             {loading ? 'Saving...' : 'Save Box'}
           </button>
        </div>
      </form>
    </div>
  );
}
