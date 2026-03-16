'use client';

import { useState, useEffect } from 'react';
import { Upload, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategory() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setCategory(data);
        setImageUrl(data.image_url);
      } else if (error) {
        console.error('Error fetching category:', error);
        alert('Failed to fetch category details');
        router.push('/admin/categories');
      }
      setFetching(false);
    }

    if (id) fetchCategory();
  }, [id, router, supabase]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `category_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert(`Failed to upload image: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const slug = formData.get('slug') as string;

    // Stricter Validation: No slashes, spaces, or protocol strings
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      alert('Slug must contain only lowercase letters, numbers, and hyphens. No slashes, spaces, or special characters are allowed.');
      setLoading(false);
      return;
    }

    const updatedCategory = {
      name_en: formData.get('name_en') as string,
      name_ar: formData.get('name_ar') as string,
      slug: slug,
      image_url: imageUrl,
    };

    const { error } = await supabase
      .from('categories')
      .update(updatedCategory)
      .eq('id', id);

    setLoading(false);

    if (error) {
      console.error('Error updating category:', error);
      alert(`Failed to update category: ${error.message}`);
    } else {
      router.push('/admin/categories');
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/categories" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-serif text-[var(--color-luxury-black)]">Edit Category</h1>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (English) *</label>
              <input 
                name="name_en" 
                type="text" 
                required 
                defaultValue={category?.name_en}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (Arabic) *</label>
              <input 
                name="name_ar" 
                type="text" 
                required 
                defaultValue={category?.name_ar}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none text-right font-arabic" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Key) *</label>
              <input 
                name="slug" 
                type="text" 
                required 
                defaultValue={category?.slug}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none font-mono text-sm" 
              />
              <p className="text-[10px] text-gray-400 mt-1">Changing this will update the URL and may affect SEO or existing links.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <h2 className="text-lg font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-2">Category Image</h2>
          
          {imageUrl ? (
            <div className="relative w-40 h-40 mx-auto border-2 border-[var(--color-rose-gold)] rounded-full overflow-hidden shadow-lg">
              <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer flex flex-col items-center justify-center transition-colors ${uploadingImage ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              {uploadingImage ? (
                <>
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-[var(--color-luxury-black)]">Upload Category Image</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended square or circular crop</p>
                </>
              )}
            </label>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/admin/categories" className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md text-sm font-medium uppercase tracking-widest">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-3 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors rounded-md text-sm font-medium uppercase tracking-widest flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
