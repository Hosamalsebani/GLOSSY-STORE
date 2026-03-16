'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ShieldCheck, UserPlus, Trash2, Mail, Calendar, Loader2, Key } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // NOTE: In a real production environment, creating a user usually requires service role.
      // Here we assume the client has appropriate permissions or we use a custom Edge Function.
      // For this implementation, we'll try to sign them up normally through the client if possible,
      // or at least add them to the admins table if the auth part is handled elsewhere.
      
      // Since we can't easily use the admin auth API from the browser without service role,
      // and the user specifically asked to ADD an admin, we'll implement a logic that
      // adds them to the 'admins' table. 
      // IMPORTANT: The actual login will still depend on Supabase Auth.
      
      const { error: tableError } = await supabase
        .from('admins')
        .insert([{ 
          email: newAdmin.email,
          secret_key: newAdmin.password // Storing "password" in secret_key for demo purposes as requested, though insecure
        }]);

      if (tableError) throw tableError;

      alert('Admin record added locally. Note: They still need a corresponding Supabase Auth account to log in.');
      setIsAddingAdmin(false);
      setNewAdmin({ email: '', password: '' });
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      alert(`Failed to add admin: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAdmin = async (id: string, email: string) => {
    if (confirm(`Remove admin access for ${email}?`)) {
      try {
        const { error } = await supabase
          .from('admins')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setAdmins(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Failed to remove admin.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)]">Admin Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system administrators and their security keys</p>
        </div>
        <button
          onClick={() => setIsAddingAdmin(!isAddingAdmin)}
          className="flex items-center gap-2 bg-[var(--color-luxury-black)] text-white px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-rose-gold)] transition-colors shadow-sm"
        >
          {isAddingAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {isAddingAdmin ? 'View Admins' : 'Add New Admin'}
        </button>
      </div>

      {isAddingAdmin ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 max-w-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
          <h2 className="text-xl font-serif text-[var(--color-luxury-black)] mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[var(--color-rose-gold)]" />
            Create New Administrator
          </h2>
          <form onSubmit={handleCreateAdmin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none transition-all"
                    placeholder="admin@example.com"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passphrase / Secret Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none transition-all"
                    placeholder="••••••••"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Note: This key is used for additional verification in certain admin flows.
                </p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[var(--color-luxury-black)] text-white px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-rose-gold)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Admin Access'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingAdmin(false)}
                className="px-6 py-3 border border-gray-300 text-gray-600 rounded-md text-sm font-medium uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 text-left font-medium">Administrator</th>
                  <th className="p-4 text-left font-medium">Secret Key</th>
                  <th className="p-4 text-left font-medium">Joined Date</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Fetching admins...</p>
                    </td>
                  </tr>
                ) : admins.length > 0 ? (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-rose-gold)]/10 text-[var(--color-rose-gold)] flex items-center justify-center font-bold text-xs">
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{admin.email}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{admin.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Key className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-sm font-mono tracking-tighter">
                            {admin.secret_key ? '••••' + admin.secret_key.slice(-4) : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(admin.created_at), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteAdmin(admin.id, admin.email)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          title="Revoke Admin Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400">
                      <p className="text-sm italic">No administrators found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
