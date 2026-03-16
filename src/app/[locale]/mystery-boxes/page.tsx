'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Link } from '@/i18n/routing';
import { ShoppingBag } from 'lucide-react';
import { useAppStore } from '@/store';

export default function MysteryBoxesPage() {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const addToCart = useAppStore(state => state.addToCart);

  useEffect(() => {
    async function fetchBoxes() {
      try {
        const { data, error } = await supabase.from('mystery_boxes').select('*');
        if (data) setBoxes(data);
      } catch (err) {
        console.error('Error fetching mystery boxes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBoxes();
  }, [supabase]);

  const handleAddToCart = (e: React.MouseEvent, box: any) => {
    e.preventDefault();
    addToCart({
      id: box.id,
      name: box.name,
      price: box.price,
      image_url: box.image_url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
      brand: 'Glossy',
      category: 'Mystery Box'
    } as any);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-luxury-black)] mb-4">Mystery Boxes</h1>
          <p className="text-gray-600 text-lg">
            Experience the thrill of discovery with our curated mystery boxes.
            Each box is filled with premium beauty products selected by our experts.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[var(--color-rose-gold)]"></div>
          </div>
        ) : boxes.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No mystery boxes available at the moment. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boxes.map((box, index) => (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={box.image_url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'} 
                    alt={box.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end">
                    <span className="text-white font-serif text-xl">${box.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-medium text-[var(--color-luxury-black)] mb-2 font-serif">{box.name}</h3>
                  <p className="text-gray-600 mb-6 flex-grow text-sm line-clamp-3">{box.description}</p>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, box)}
                    className="w-full py-3 bg-white border border-[var(--color-luxury-black)] text-[var(--color-luxury-black)] hover:bg-[var(--color-luxury-black)] hover:text-white transition-colors uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2 group-hover:bg-[var(--color-luxury-black)] group-hover:text-white"
                  >
                    <ShoppingBag size={18} /> Add to Bag
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
