'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Mail, Loader2, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cooldown > 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/en/reset-password`,
      });

      if (resetError) {
        if (resetError.message.toLowerCase().includes('rate limit')) {
          setCooldown(60);
          setError('Too many requests. Please wait 60 seconds before trying again.');
          return;
        }
        throw resetError;
      }
      setSent(true);
      setCooldown(60);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('rate limit')) {
        setCooldown(60);
        setError('Too many requests. Please wait 60 seconds before trying again.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-serif text-[var(--color-luxury-black)]">Check Your Email</h2>
          <p className="text-gray-500 text-sm">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your inbox and follow the link to reset your password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-luxury-black)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-gray-100 shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-serif text-[var(--color-luxury-black)]">
            Forgot Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 placeholder-gray-400 focus:outline-none focus:border-[var(--color-luxury-black)] transition-colors sm:text-sm"
                placeholder="hello@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cooldown > 0}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium text-white bg-[var(--color-luxury-black)] hover:bg-[var(--color-rose-gold)] focus:outline-none transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : cooldown > 0 ? (
              <><Clock className="h-4 w-4" /> Wait {cooldown}s</>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--color-luxury-black)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
