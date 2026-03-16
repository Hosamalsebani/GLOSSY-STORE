'use client';

import { useEffect, useState } from 'react';
import { Truck, Plus, Trash2, Save, X, Edit2, Loader2 } from 'lucide-react';

type ShippingRate = {
  id: string;
  city_name_en: string;
  city_name_ar: string;
  cost: number;
  active: boolean;
};

export default function AdminShippingPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newRate, setNewRate] = useState<Partial<ShippingRate>>({
    city_name_en: '',
    city_name_ar: '',
    cost: 0,
    active: true
  });

  const [editRate, setEditRate] = useState<Partial<ShippingRate>>({});

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shipping');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch rates');
      setRates(json.rates || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newRate.city_name_en || !newRate.city_name_ar) return;
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRate)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create rate');
      
      setIsAdding(false);
      setNewRate({ city_name_en: '', city_name_ar: '', cost: 0, active: true });
      fetchRates();
      alert('Shipping rate saved successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editRate.city_name_en || !editRate.city_name_ar) return;
    try {
      const res = await fetch(`/api/admin/shipping`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editRate })
      });
      if (!res.ok) throw new Error('Failed to update rate');
      setEditingId(null);
      fetchRates();
      alert('Shipping rate updated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return;
    try {
      const res = await fetch(`/api/admin/shipping`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Failed to delete rate');
      fetchRates();
      alert('Shipping rate deleted successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Shipping Rates</h1>
          <p className="text-gray-500 text-sm">Manage shipping costs for different cities across Libya.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[var(--color-luxury-black)] text-white px-4 py-2 hover:bg-[var(--color-rose-gold)] transition-colors text-sm uppercase tracking-widest"
        >
          <Plus size={16} /> Add New Rate
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="mx-auto mb-4 text-gray-300 animate-spin" size={48} />
          <p className="text-sm text-gray-500 uppercase tracking-widest">Loading Rates...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-8 text-center rounded">
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">City (EN)</th>
                <th className="px-6 py-4 text-right">City (AR)</th>
                <th className="px-6 py-4">Cost (LYD)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isAdding && (
                <tr className="bg-blue-50/30">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="e.g., Tripoli"
                      title="City EN"
                      value={newRate.city_name_en}
                      onChange={(e) => setNewRate({ ...newRate, city_name_en: e.target.value })}
                      className="w-full border border-gray-200 px-3 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="e.g., طرابلس"
                      title="City AR"
                      value={newRate.city_name_ar}
                      onChange={(e) => setNewRate({ ...newRate, city_name_ar: e.target.value })}
                      className="w-full border border-gray-200 px-3 py-1.5 text-sm text-right font-arabic"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      title="Cost"
                      value={isNaN(newRate.cost as number) ? '' : newRate.cost}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numVal = parseFloat(val);
                        setNewRate({ ...newRate, cost: isNaN(numVal) ? 0 : numVal });
                      }}
                      className="w-24 border border-gray-200 px-3 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-green-600 font-medium font-arabic">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={handleCreate} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                        <Save size={18} />
                      </button>
                      <button onClick={() => setIsAdding(false)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded" title="Cancel">
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === rate.id ? (
                      <input
                        type="text"
                        title="City EN"
                        value={editRate.city_name_en}
                        onChange={(e) => setEditRate({ ...editRate, city_name_en: e.target.value })}
                        className="w-full border border-gray-200 px-3 py-1.5 text-sm"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{rate.city_name_en}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === rate.id ? (
                      <input
                        type="text"
                        title="City AR"
                        value={editRate.city_name_ar}
                        onChange={(e) => setEditRate({ ...editRate, city_name_ar: e.target.value })}
                        className="w-full border border-gray-200 px-3 py-1.5 text-sm text-right font-arabic"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 font-arabic">{rate.city_name_ar}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === rate.id ? (
                      <input
                        type="number"
                        title="Cost"
                        value={isNaN(editRate.cost as number) ? '' : editRate.cost}
                        onChange={(e) => {
                          const val = e.target.value;
                          const numVal = parseFloat(val);
                          setEditRate({ ...editRate, cost: isNaN(numVal) ? 0 : numVal });
                        }}
                        className="w-24 border border-gray-200 px-3 py-1.5 text-sm"
                      />
                    ) : (
                      <span className="text-sm font-semibold">{rate.cost.toFixed(2)} د.ل</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${rate.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {rate.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === rate.id ? (
                        <>
                          <button onClick={handleUpdate} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                            <Save size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded" title="Cancel">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(rate.id);
                              setEditRate(rate);
                            }}
                            className="p-1.5 text-gray-400 hover:text-[var(--color-luxury-black)] hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(rate.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
