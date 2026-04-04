'use client';

import { useState, useEffect, use } from 'react';
import { Upload, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const productId = unwrappedParams.id;
  const router = useRouter();

  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]); // New state for variants
  const [categories, setCategories] = useState<{slug: string, name_en: string}[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('slug, name_en').order('name_en');
      if (data) setCategories(data);
      if (error) console.error('Error fetching categories:', error);
    }
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (data) {
        setProduct(data);
        // Load existing images: image_url + additional_images
        const allImages: string[] = [];
        if (data.image_url) allImages.push(data.image_url);
        if (data.additional_images && Array.isArray(data.additional_images)) {
          allImages.push(...data.additional_images);
        }
        setImages(allImages);
        // Load variants
        if (data.variants && Array.isArray(data.variants)) {
          setVariants(data.variants);
        }
      } else if (error) {
        console.error('Error fetching product:', error);
        alert('Product not found.');
        router.push('/admin/products');
      }
    }
    fetchProduct();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImages(prev => [...prev, publicUrl]);
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert(`Failed to upload image: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const url = images[indexToRemove];
    try {
      if (url.includes('/product-images/')) {
        const path = url.split('/product-images/')[1];
        if (path) await supabase.storage.from('product-images').remove([path]);
      }
    } catch (_) {}
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const updatedProduct = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      price: parseFloat(formData.get('price') as string),
      cost_price: parseFloat(formData.get('cost_price') as string) || 0,
      category: formData.get('category') as string,
      stock: parseInt(formData.get('stock') as string) || 0,
      discount_percentage: parseFloat(formData.get('discount_percentage') as string) || 0,
      description: formData.get('description') as string,
      ingredients: formData.get('ingredients') as string,
      ingredients_ar: formData.get('ingredients_ar') as string,
      usage: formData.get('usage') as string,
      usage_ar: formData.get('usage_ar') as string,
      image_url: images.length > 0 ? images[0] : null,
      additional_images: images.length > 1 ? images.slice(1) : [],
      is_weekend_offer: formData.get('is_weekend_offer') === 'on',
      slug: formData.get('slug') as string,
      variants: variants, // Include variants in update
    };

    const { error } = await supabase.from('products').update(updatedProduct).eq('id', productId);
    setLoading(false);

    if (error) {
      console.error('Error updating product:', error);
      alert(`Failed to update product: ${error.message}${error.details ? ' - ' + error.details : ''}`);
    } else {
      router.push('/admin/products');
    }
  };

  if (!product) return <div className="p-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-serif text-[var(--color-luxury-black)]">Edit Product</h1>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <h2 className="text-lg font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-2">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input id="name" name="name" type="text" required defaultValue={product.name} placeholder="Enter product name (e.g. Luxury Silk Cream)" title="Product Name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
              <input id="slug" name="slug" type="text" required defaultValue={product.slug} placeholder="e.g. magic-cream-v2" title="URL Slug" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
              <p className="text-xs text-gray-500 mt-1">Used for the product URL: /shop/slug</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input id="brand" name="brand" type="text" defaultValue={product.brand} placeholder="e.g. Glossy Beauty" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" required defaultValue={product.category} aria-label="Category" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none">
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name_en}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" name="description" rows={4} defaultValue={product.description} placeholder="Describe the product features and benefits..." className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (English)</label>
                <textarea name="ingredients" rows={4} defaultValue={product.ingredients} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" placeholder="List ingredients in English..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right font-arabic">المكونات (العربية)</label>
                <textarea name="ingredients_ar" rows={4} dir="rtl" defaultValue={product.ingredients_ar} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none font-arabic" placeholder="قائمة المكونات بالعربية..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How to Use (English)</label>
                <textarea name="usage" rows={4} defaultValue={product.usage} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" placeholder="Application instructions in English..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right font-arabic">طريقة الاستخدام (العربية)</label>
                <textarea name="usage_ar" rows={4} dir="rtl" defaultValue={product.usage_ar} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none font-arabic" placeholder="تعليمات الاستخدام بالعربية..." />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <h2 className="text-lg font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (د.ل) *</label>
              <input name="price" type="number" step="0.01" min="0" required defaultValue={product.price} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-luxury-gold)] mb-1 font-bold">Cost Price *</label>
              <input name="cost_price" type="number" step="0.01" min="0" required defaultValue={product.cost_price || 0} className="w-full px-4 py-2 border border-[var(--color-luxury-gold)]/40 rounded-md focus:ring-[var(--color-luxury-gold)] focus:border-[var(--color-luxury-gold)] outline-none bg-[var(--color-luxury-gold)]/5" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input name="stock" type="number" min="0" defaultValue={product.stock} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input name="discount_percentage" type="number" step="1" min="0" max="100" defaultValue={product.discount_percentage || 0} placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none" />
              {product.discount_percentage > 0 && (
                <p className="text-xs text-green-600 mt-1">Final price: {(product.price * (1 - (product.discount_percentage || 0) / 100)).toFixed(2)} د.ل</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
            <input 
              id="is_weekend_offer" 
              name="is_weekend_offer" 
              type="checkbox" 
              defaultChecked={product.is_weekend_offer}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 border-gray-300 transition-all cursor-pointer" 
            />
            <label htmlFor="is_weekend_offer" className="text-sm font-bold text-gray-800 cursor-pointer select-none">
              Featured in Weekend Offers (Sky Blue Section)
            </label>
          </div>
        </div>

        {/* Variants / Colors Section */}
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h2 className="text-lg font-serif text-[var(--color-luxury-black)]">Product Variants / Colors</h2>
            <button 
              type="button" 
              onClick={() => setVariants([...variants, { name_ar: '', name_en: '', hex: '#000000', image_url: '' }])}
              className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-[var(--color-gold-luxury)] transition-colors font-bold uppercase"
            >
              + Add Color
            </button>
          </div>
          
          <div className="space-y-4">
            {variants.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No variants added. Use this for lenses, lipsticks, etc.</p>
            ) : (
              variants.map((v, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                  <button 
                    type="button" 
                    onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove variant"
                  >
                    <X size={12} />
                  </button>
                  
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Color Name (AR)</label>
                      <input 
                        type="text" 
                        value={v.name_ar} 
                        onChange={(e) => {
                          const newV = [...variants];
                          newV[idx].name_ar = e.target.value;
                          setVariants(newV);
                        }}
                        dir="rtl"
                        placeholder="مثلاً: أزرق سماوي"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-black outline-none font-arabic" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Color Name (EN)</label>
                      <input 
                        type="text" 
                        value={v.name_en} 
                        onChange={(e) => {
                          const newV = [...variants];
                          newV[idx].name_en = e.target.value;
                          setVariants(newV);
                        }}
                        placeholder="e.g. Sky Blue"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-black outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hex Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={v.hex} 
                          onChange={(e) => {
                            const newV = [...variants];
                            newV[idx].hex = e.target.value;
                            setVariants(newV);
                          }}
                          className="w-8 h-8 p-0 border-none rounded-full cursor-pointer bg-transparent" 
                        />
                        <input 
                          type="text" 
                          value={v.hex} 
                          onChange={(e) => {
                            const newV = [...variants];
                            newV[idx].hex = e.target.value;
                            setVariants(newV);
                          }}
                          placeholder="#000000"
                          className="flex-grow px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-black outline-none font-mono" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Variant Image URL</label>
                      <input 
                        type="text" 
                        value={v.image_url} 
                        onChange={(e) => {
                          const newV = [...variants];
                          newV[idx].image_url = e.target.value;
                          setVariants(newV);
                        }}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-black outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-lg space-y-6">
          <h2 className="text-lg font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-2">
            Product Images
            <span className="text-sm font-normal text-gray-400 ml-2">First image is the main display image</span>
          </h2>

          {images.length > 0 && (
            <div className="flex gap-4 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className={`relative w-24 h-24 flex-shrink-0 border-2 rounded-md overflow-hidden ${i === 0 ? 'border-[var(--color-rose-gold)]' : 'border-gray-200'}`}>
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">Main</span>}
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm hover:bg-red-50"
                  >
                    <X size={12} className="text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
                <p className="text-sm font-medium text-[var(--color-luxury-black)]">Click to upload another image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP (max 10MB)</p>
              </>
            )}
          </label>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/admin/products" className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md text-sm font-medium uppercase tracking-widest">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-3 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors rounded-md text-sm font-medium uppercase tracking-widest flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
