'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Download, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';
import { Star } from 'lucide-react'; // Added Star import

const STOCK_OPTIONS = ['All', 'In Stock', 'Out of Stock'];

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [dbCategories, setDbCategories] = useState<{slug: string, name_en: string}[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const filterRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);

        const { data: catData } = await supabase.from('categories').select('slug, name_en').order('name_en');
        if (catData) setDbCategories(catData);
      } catch (err) {
        console.error('Error fetching admin products or categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;

    const stock = product.stock ?? 0;
    const matchesStock =
      filterStock === 'All' ||
      (filterStock === 'In Stock' && stock > 0) ||
      (filterStock === 'Out of Stock' && stock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert('Failed to delete product.');
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Status'];
    const rows = filteredProducts.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.category || '',
      p.price?.toFixed(2) || '0.00',
      p.stock ?? 0,
      (p.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeFilters = (filterCategory !== 'All' ? 1 : 0) + (filterStock !== 'All' ? 1 : 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Products</h1>
          <p className="text-gray-500 text-sm">Manage your inventory, pricing, and product details.</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors rounded-md text-sm font-medium whitespace-nowrap">
          <Plus size={16} /> Add Product
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto relative" ref={filterRef}>
          {/* Filter Button */}
          <button
            onClick={() => setShowFilter(v => !v)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors relative ${
              activeFilters > 0
                ? 'border-[var(--color-luxury-black)] bg-[var(--color-luxury-black)] text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filter
            {activeFilters > 0 && (
              <span className="ml-1 bg-white text-[var(--color-luxury-black)] rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </button>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-lg z-50 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Filters</span>
                <button
                  onClick={() => { setFilterCategory('All'); setFilterStock('All'); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Clear all
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterCategory('All')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      filterCategory === 'All'
                        ? 'bg-[var(--color-luxury-black)] text-white border-[var(--color-luxury-black)]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    All
                  </button>
                  {dbCategories.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => setFilterCategory(cat.slug)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filterCategory === cat.slug
                          ? 'bg-[var(--color-luxury-black)] text-white border-[var(--color-luxury-black)]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {cat.name_en}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock</label>
                <div className="flex flex-wrap gap-2">
                  {STOCK_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFilterStock(opt)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filterStock === opt
                          ? 'bg-[var(--color-luxury-black)] text-white border-[var(--color-luxury-black)]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowFilter(false)}
                className="w-full py-2 bg-[var(--color-luxury-black)] text-white text-sm rounded-md hover:bg-[var(--color-rose-gold)] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors rounded-md text-sm font-medium"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filterCategory !== 'All' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              Category: {filterCategory}
              <button onClick={() => setFilterCategory('All')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {filterStock !== 'All' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              Stock: {filterStock}
              <button onClick={() => setFilterStock('All')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Product Table */}
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
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Pricing</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest text-center">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Stock</th>
                  <th className="p-4 font-medium">Offer</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                          )}
                        </div>
                        <p className="font-medium text-[var(--color-luxury-black)] line-clamp-1">{product.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 capitalize">{product.category || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{product.price?.toFixed(2) || '0.00'} د.ل</span>
                        {(product.discount_percentage || 0) > 0 && (
                          <span className="text-xs text-green-600 font-medium">-{product.discount_percentage}% OFF</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">{(product.rating || 0).toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{product.review_count || 0} reviews</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{product.stock ?? 0}</td>
                    <td className="p-4">
                      {product.is_weekend_offer ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          Weekend
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (product.stock ?? 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {(product.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/${product.id}/edit`} className="p-1 text-gray-400 hover:text-[var(--color-luxury-black)] transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No products found.
            </div>
          )}
        </div>

        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{filteredProducts.length}</span> of <span className="font-medium text-gray-700">{products.length}</span> products
          </p>
        </div>
      </div>
    </div>
  );
}
