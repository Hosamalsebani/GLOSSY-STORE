'use client';

import { useState, useEffect } from 'react';
import { Truck, MapPin, PhoneCall, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type ShippingZone = {
  id: string;
  city: string;
  cost: number;
  estimated_days: string | null;
};

export default function ShippingPage() {
  const [cities, setCities] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const { data, error } = await supabase
          .from('shipping_zones')
          .select('*')
          .order('city', { ascending: true });
          
        if (error) throw error;
        if (data) {
          setCities(data);
        }
      } catch (error) {
        console.error('Error fetching shipping zones:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchZones();
  }, []);

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] text-center mb-4">Shipping & Delivery</h1>
        <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16 text-lg">
          We proudly deliver our luxury beauty products safely and securely to major cities across Libya.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-8 flex items-center justify-center gap-3">
            <MapPin className="w-6 h-6 text-[var(--color-rose-gold)]" />
            Delivery Prices in Libya
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-2 bg-[var(--color-rose-gold)]/10 text-[var(--color-luxury-black)] font-medium p-4 border-b border-gray-100">
              <div>City</div>
              <div className="text-right">Delivery Cost (LYD)</div>
            </div>
            
            {loading ? (
              <div className="p-8 flex justify-center items-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : cities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No shipping zones defined yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cities.map((city) => (
                  <div key={city.id} className="grid grid-cols-2 p-4 hover:bg-gray-50 transition-colors">
                    <div className="text-gray-700 font-medium">{city.city}</div>
                    <div className="text-right text-[var(--color-rose-gold)] font-semibold">{city.cost} LYD</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 bg-gray-50 p-6 border-l-4 border-[var(--color-rose-gold)] rounded-r-lg flex flex-col sm:flex-row items-start gap-4">
            <PhoneCall className="w-6 h-6 text-[var(--color-rose-gold)] flex-shrink-0 mt-1" />
            <p className="text-gray-600 text-base leading-relaxed">
              Delivery usually takes <strong className="text-[var(--color-luxury-black)]">1–3 business days</strong> depending on the city. Our team will contact you by phone to confirm the order before shipping.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-6 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[var(--color-rose-gold)]" />
              Order Security & Handling
            </h2>
            <div className="prose text-gray-600 max-w-none">
              <p className="mb-4">
                We handle every luxury item with the utmost care, ensuring your products arrive in pristine condition. All orders are securely packaged to protect against damage during transit.
              </p>
              <p>
                If you have any questions regarding your delivery or if you need to update your address, please contact our customer support before your order is dispatched.
              </p>
            </div>
          </section>
        </div>
        
      </div>
    </div>
  );
}
