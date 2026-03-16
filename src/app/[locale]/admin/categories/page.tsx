'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  image_url: string;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
        if (data) setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();

    const channel = supabase
      .channel('categories-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredCategories = categories.filter(category => 
    category.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_ar.includes(searchTerm) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Products in this category might not display correctly.')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert('Failed to delete category: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Categories</h1>
          <p className="text-gray-500 text-sm">Manage your product categories and their visual identity.</p>
        </div>
        <Link href="/admin/categories/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors rounded-md text-sm font-medium whitespace-nowrap">
          <Plus size={16} /> Add Category
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] sm:text-sm transition-colors"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-luxury-black)] border-t-transparent mx-auto"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Slug</th>
                  <th className="p-4 font-medium">Name (AR)</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                          {category.image_url ? (
                            <img src={category.image_url} alt={category.name_en} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Img</div>
                          )}
                        </div>
                        <p className="font-medium text-[var(--color-luxury-black)] line-clamp-1">{category.name_en}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{category.slug}</td>
                    <td className="p-4 text-gray-600 text-right font-arabic">{category.name_ar}</td>
                    <td className="p-4 text-gray-500 text-xs text-center">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/categories/${category.id}/edit`} className="p-1 text-gray-400 hover:text-[var(--color-luxury-black)] transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(category.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredCategories.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
