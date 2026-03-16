'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';

export default function AdminMysteryBoxesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBoxes() {
      try {
        const { data, error } = await supabase.from('mystery_boxes').select('*').order('created_at', { ascending: false });
        if (data) setBoxes(data);
      } catch (err) {
        console.error('Error fetching admin mystery boxes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBoxes();

    const channel = supabase
      .channel('schema-db-changes-boxes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mystery_boxes' },
        (payload) => {
          fetchBoxes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredBoxes = boxes.filter(box => 
    box.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this mystery box?')) {
      const { error } = await supabase.from('mystery_boxes').delete().eq('id', id);
      if (error) {
        console.error('Error deleting mystery box:', error);
        alert('Failed to delete mystery box.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Mystery Boxes</h1>
          <p className="text-gray-500 text-sm">Manage your mystery box offerings.</p>
        </div>
        <Link href="/admin/mystery-boxes/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors rounded-md text-sm font-medium whitespace-nowrap">
          <Plus size={16} /> Add Box
        </Link>
      </div>

      <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] sm:text-sm transition-colors"
            placeholder="Search mystery boxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 text-center flex justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-[var(--color-luxury-black)] border-t-transparent"></div>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-medium">Box</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredBoxes.map((box) => (
                  <tr key={box.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                          {box.image_url ? (
                            <img src={box.image_url} alt={box.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-luxury-black)] line-clamp-1">{box.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                        <span className="line-clamp-1">{box.description || '-'}</span>
                    </td>
                    <td className="p-4 font-medium text-[var(--color-luxury-black)]">${box.price?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/mystery-boxes/${box.id}/edit`} className="p-1 text-gray-400 hover:text-[var(--color-luxury-black)] transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(box.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredBoxes.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No mystery boxes found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
