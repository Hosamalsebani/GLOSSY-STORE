'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Phone, CalendarCheck, ShoppingBag, DollarSign, Ban, UserCheck, Loader2 } from 'lucide-react';

type Customer = {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  joinedAt: string;
  orderCount: number;
  totalSpent: number;
  isBlocked?: boolean;
};

export default function AdminCustomersPage() {
  const t = useTranslations('Admin.customerList');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to load customers.');
        return;
      }

      setCustomers(json.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    if (!userId || userId.startsWith('guest-')) {
      alert('Cannot block guest customers without a registered account.');
      return;
    }

    if (!confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !currentStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to update status');
      }

      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === userId ? { ...c, isBlocked: !currentStatus } : c
      ));
    } catch (err: any) {
      console.error('Error toggling block status:', err);
      alert(err.message || 'An error occurred while updating status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('subtitle')}</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-[var(--color-luxury-gold)] rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-400 uppercase tracking-widest">{t('loading')}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-8 text-center rounded-lg">
          <p>{error}</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm p-16 text-center rounded-lg">
          <User className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-500">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl border border-gray-100 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse rtl">
              <thead>
                <tr className="bg-gray-50/50 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
                  <th className="p-6 font-semibold text-start">{t('name')}</th>
                  <th className="p-6 font-semibold text-start">{t('contact')}</th>
                  <th className="p-6 font-semibold text-start">{t('joined')}</th>
                  <th className="p-6 font-semibold text-center">{t('orders')}</th>
                  <th className="p-6 font-semibold text-center">{t('totalSpent')}</th>
                  <th className="p-6 font-semibold text-center">{t('actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/80 transition-all duration-300">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-luxury-gold)]/10 flex items-center justify-center text-[var(--color-luxury-gold)] shadow-inner">
                          <User size={22} />
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--color-luxury-black)] text-lg">
                            {customer.name || t('anonymous')}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-gray-600">
                      {customer.phone ? (
                        <div className="flex items-center gap-2 justify-start">
                          <Phone size={14} className="text-[var(--color-luxury-gold)]" />
                          <span className="text-sm font-medium">{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">{t('noPhone')}</span>
                      )}
                    </td>
                    <td className="p-6 text-gray-500">
                      <div className="flex items-center gap-2 justify-start">
                        <CalendarCheck size={14} className="text-gray-400" />
                        <span className="text-sm">
                          {customer.joinedAt ? new Date(customer.joinedAt).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600">
                          <ShoppingBag size={14} />
                        </div>
                        <span className="text-sm font-bold text-[var(--color-luxury-black)]">
                          {customer.orderCount}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600">
                          <DollarSign size={14} />
                        </div>
                        <span className="text-lg font-serif font-bold text-[var(--color-luxury-gold)]">
                          ${customer.totalSpent.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      {!customer.id.startsWith('guest-') ? (
                        <button
                          onClick={() => handleToggleBlock(customer.id, !!customer.isBlocked)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            customer.isBlocked
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                          title={customer.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {customer.isBlocked ? (
                            <>
                              <UserCheck size={16} />
                              <span>{t('unblock') || 'Unblock'}</span>
                            </>
                          ) : (
                            <>
                              <Ban size={16} />
                              <span>{t('block') || 'Block'}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
