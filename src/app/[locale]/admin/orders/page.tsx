'use client';

import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, FileText } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/invoice';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  region: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  cart_items: CartItem[] | null;
  coupon_code: string | null;
  discount_amount: number | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Failed to load orders.'); return; }
      setOrders(json.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.error || 'Failed to update status.'); return; }

      const selectedOrder = orders.find(o => o.id === orderId);

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      if (json.stockDeducted) {
        console.log('✅ Stock was automatically deducted for approved order.');
      }

      // Automatically open WhatsApp when approved
      if (newStatus === 'processing' && selectedOrder && selectedOrder.customer_phone) {
        openWhatsAppMessage(selectedOrder);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openWhatsAppMessage = (order: Order) => {
    if (!order.customer_phone) {
      alert('No customer phone number available for this order.');
      return;
    }
    
    let phone = order.customer_phone.replace(/\D/g, '');
    
    // Auto-format Libyan numbers (09X -> 2189X)
    if (phone.length === 10 && phone.startsWith('09')) {
      phone = '218' + phone.substring(1);
    } else if (phone.startsWith('00')) {
      phone = phone.substring(2);
    }

    let message = `مرحباً ${order.customer_name || 'عميلنا العزيز'}،\n\nلقد تمت الموافقة على طلبك بقيمة ${Number(order.total_amount || 0).toFixed(2)} د.ل و جاري تجهيزه.\n\n`;
    if (order.cart_items && order.cart_items.length > 0) {
      message += `📦 تفاصيل الطلب:\n`;
      order.cart_items.forEach(item => {
        message += `- ${item.name} (الكمية: ${item.quantity})\n`;
      });
    }
    message += `\nشكراً لتسوقك معنا في GLOSSY ✨!`;
    
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Orders</h1>
        <p className="text-gray-500 text-sm">Manage and approve customer orders. Approving an order will automatically deduct stock and open WhatsApp to notify the customer.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500 uppercase tracking-widest">Loading Orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-8 text-center rounded">
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm p-12 text-center">
          <Package className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-[var(--color-luxury-black)]">{order.customer_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone || order.customer_email || '—'}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs text-gray-400">{order.region}</p>
                    <p className="text-xs text-gray-300">{order.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-right">
                    <p className="font-medium text-[var(--color-luxury-black)]">
                      ${Number(order.total_amount || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ar-LY')}</p>
                  </div>

                  <select
                    value={order.status || 'pending'}
                    disabled={updatingId === order.id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    title="Update Order Status"
                    className={`text-xs px-3 py-1.5 outline-none rounded font-medium cursor-pointer ${STATUS_STYLES[order.status] || 'bg-gray-100'} ${updatingId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="processing">✅ Approved</option>
                    <option value="shipped">🚚 Shipped</option>
                    <option value="delivered">📦 Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>

                  <div className="flex items-center gap-1 border-l border-gray-200 pl-2 md:pl-4 ml-1 md:ml-2">
                    {/* WhatsApp Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsAppMessage(order);
                      }}
                      title="Send WhatsApp Message"
                      className="p-1.5 text-gray-400 hover:text-[#25D366] hover:bg-green-50 rounded transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                    {/* PDF Invoice Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateInvoicePDF(order);
                      }}
                      title="Print Arabic Invoice"
                      className="p-1.5 text-gray-400 hover:text-[var(--color-luxury-gold)] hover:bg-gray-50 rounded transition-colors"
                    >
                      <FileText size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Order Items */}
              {expandedId === order.id && order.cart_items && (
                <div className="px-5 pb-5 border-t border-gray-50">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mt-4 mb-3">Order Items</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="text-left pb-2">Product</th>
                        <th className="text-center pb-2">Qty</th>
                        <th className="text-right pb-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.cart_items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50">
                          <td className="py-2 text-[var(--color-luxury-black)]">{item.name}</td>
                          <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-2 text-right text-gray-600">{Number(item.price || 0).toFixed(2)} د.ل</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} className="pt-3 text-right text-xs text-gray-400 uppercase tracking-wider">Total</td>
                        <td className="pt-3 text-right font-bold text-[var(--color-luxury-black)]">{Number(order.total_amount || 0).toFixed(2)} د.ل</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
