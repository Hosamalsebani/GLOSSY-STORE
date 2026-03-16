'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Package, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;

  // Mock order details
  const order = {
    id: orderId || 'GL-459201',
    date: 'October 12, 2023',
    status: 'Delivered',
    total: 245.00,
    shippingCost: 10.00, // Tripoli delivery
    items: [
      { name: 'Radiant Glow Foundation', quantity: 1, price: 120.00, image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop' },
      { name: 'Silk Finish Setting Powder', quantity: 1, price: 115.00, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2000&auto=format&fit=crop' }
    ],
    shippingAddress: {
      name: 'Sarah Ben Ali',
      phone: '+218 91 123 4567',
      address: 'Gergaresh Road',
      city: 'Tripoli',
      country: 'Libya'
    },
    paymentMethod: 'Cash on Delivery (COD)'
  };

  const trackingSteps = [
    { label: 'Order Placed', date: 'Oct 12, 2023 10:30 AM', completed: true },
    { label: 'Processing', date: 'Oct 12, 2023 2:15 PM', completed: true },
    { label: 'Out for Delivery', date: 'Oct 13, 2023 9:00 AM', completed: true },
    { label: 'Delivered', date: 'Oct 13, 2023 4:45 PM', completed: order.status === 'Delivered' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <Link href="/account/orders" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-[var(--color-luxury-black)]">Order #{order.id}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {order.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (Left) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tracking Section */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-[var(--color-luxury-black)] mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[var(--color-rose-gold)]" />
              Tracking Status
            </h2>
            
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
              <div className="space-y-6">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.completed ? 'bg-[var(--color-rose-gold)] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="pt-1">
                      <p className={`font-medium ${step.completed ? 'text-[var(--color-luxury-black)]' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-[var(--color-luxury-black)] mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--color-rose-gold)]" />
              Items Ordered
            </h2>
            
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 relative border border-gray-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-medium text-[var(--color-luxury-black)]">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-[var(--color-luxury-black)]">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 border border-gray-100">
            <h2 className="text-lg font-medium text-[var(--color-luxury-black)] mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(order.total - order.shippingCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between font-medium text-[var(--color-luxury-black)] text-lg">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">Payment: {order.paymentMethod}</p>
          </div>

          {/* Shipping Info */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-[var(--color-luxury-black)] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-rose-gold)]" />
              Delivery Details
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-[var(--color-luxury-black)]">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
