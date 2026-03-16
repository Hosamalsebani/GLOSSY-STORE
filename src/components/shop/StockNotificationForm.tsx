'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface StockNotificationFormProps {
  productId: string;
  productName: string;
}

export default function StockNotificationForm({ productId, productName }: StockNotificationFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('stock_notifications')
        .insert([{ product_id: productId, email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          setError('You are already subscribed to notifications for this product.');
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error subscribing to stock notifications:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
        <CheckCircle className="text-green-500" size={32} />
        <div>
          <h3 className="font-serif text-lg text-green-900">Success!</h3>
          <p className="text-sm text-green-700">We'll email you as soon as {productName} is back in stock.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-[var(--color-luxury-black)]">
        <Bell size={20} className="text-[var(--color-rose-gold)]" />
        <h3 className="font-serif text-lg">Notify Me When Available</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6 font-light">
        This popular item is currently out of stock. Leave your email below and be the first to know when it's back.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-gold)] focus:border-[var(--color-rose-gold)] transition-all font-light"
          />
        </div>
        
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-luxury-black)] text-white py-4 uppercase tracking-[0.2em] text-xs font-medium hover:bg-[var(--color-rose-gold)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Notify Me'
          )}
        </button>
      </form>
    </div>
  );
}
