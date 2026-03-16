'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Save } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AccountSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || '');
      const fullName = user.user_metadata?.full_name || '';
      const parts = fullName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone(user.user_metadata?.phone_number || '');

      // Get verification status from users table
      const { data: userRecord } = await supabase
        .from('users')
        .select('is_verified, phone_number')
        .eq('email', user.email)
        .single();

      if (userRecord) {
        setIsVerified(userRecord.is_verified || false);
        if (userRecord.phone_number) setPhone(userRecord.phone_number);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: `${firstName} ${lastName}`,
          phone_number: phone,
        }
      });

      if (authError) throw authError;

      // Update users table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({
            full_name: `${firstName} ${lastName}`,
            phone_number: phone,
          })
          .eq('id', user.id);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: "Passwords don't match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setChangingPassword(true);
    setPwMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPwMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif text-[var(--color-luxury-black)] mb-2">Account Settings</h1>
        <p className="text-gray-500 text-sm">Manage your personal information and security settings.</p>
      </div>



      {/* Personal Information */}
      <div className="bg-white/50 backdrop-blur-md p-6 md:p-8 border border-gray-100 shadow-sm rounded-[1.5rem] space-y-6 transition-all hover:shadow-lg hover:border-[var(--color-rose-gold)]/30 duration-500">
        <h2 className="text-xl font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-3">Personal Information</h2>

        {message && (
          <div className={`p-3 text-sm rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-[var(--color-rose-gold)] outline-none transition-all"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-[var(--color-rose-gold)] outline-none transition-all"
                placeholder="Last Name"
              />
            </div>
          </div>
          {!email.endsWith('@user.local') && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                className="w-full px-4 py-3 border border-gray-100 rounded-lg bg-gray-50/50 text-gray-500 cursor-not-allowed outline-none"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Contact support to change your email address.</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-[var(--color-rose-gold)] outline-none transition-all"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="pt-4 text-right">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-all duration-300 rounded-full text-xs font-bold uppercase tracking-[0.2em] disabled:bg-gray-400 hover:shadow-lg hover:shadow-[var(--color-rose-gold)]/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white/50 backdrop-blur-md p-6 md:p-8 border border-gray-100 shadow-sm rounded-[1.5rem] space-y-6 transition-all hover:shadow-lg hover:border-[var(--color-rose-gold)]/30 duration-500">
        <h2 className="text-xl font-serif text-[var(--color-luxury-black)] border-b border-gray-100 pb-3">Change Password</h2>

        {pwMessage && (
          <div className={`p-3 text-sm rounded-md border ${pwMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {pwMessage.text}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleChangePassword}>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-[var(--color-rose-gold)] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-rose-gold)]/50 focus:border-[var(--color-rose-gold)] outline-none transition-all"
            />
          </div>
          <div className="pt-4 text-right">
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-all duration-300 rounded-full text-xs font-bold uppercase tracking-[0.2em] disabled:bg-gray-400 hover:shadow-lg hover:shadow-[var(--color-rose-gold)]/20"
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
