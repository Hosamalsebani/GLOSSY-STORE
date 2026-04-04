'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useRouter } from '@/i18n/routing';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User, Phone, Gift } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { useTranslations } from 'next-intl';

const getRegisterSchema = (tAuth: any, tProfile: any) => z.object({
  firstName: z.string().min(2, { message: tProfile('firstName') }),
  lastName: z.string().min(2, { message: tProfile('lastName') }),
  email: z.string().email({ message: tAuth('email') }),
  phone: z.string().min(7, { message: tProfile('phone') }),
  password: z.string().min(6, { message: tAuth('passwordTooShort') }),
  confirmPassword: z.string(),
  birthday: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: tAuth('passwordsDoNotMatch'),
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<ReturnType<typeof getRegisterSchema>>;

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const tProfile = useTranslations('Profile');
  const router = useRouter();
  const { login } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(getRegisterSchema(t, tProfile)),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      // 1. Sign up with Supabase Auth (We use our custom flow, but Supabase handles the actual user creation)
      // Note: Make sure Supabase email confirmations are disabled in the Supabase Dashboard
      // or intercept the flow using our custom OTP.
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: `${data.firstName} ${data.lastName}`,
            phone_number: data.phone,
          }
        }
      });

      if (error) {
        throw error;
      }

      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // 2. Insert the user profile into public.users table (not verified yet)
      // We will temporarily store the OTP here for verification purposes.
      if (authData.user) {
        await supabase.from('users').upsert({
          id: authData.user.id,
          email: data.email, 
          full_name: `${data.firstName} ${data.lastName}`,
          phone_number: data.phone,
          birthday: data.birthday || null,
          is_verified: false,
          custom_otp: otp, // Temporarily store OTP
          otp_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes expiry
        }, { onConflict: 'id' });
      }

      // 3. Send the stylized OTP email via Resend
      const emailRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          customerName: data.firstName,
          otp: otp
        })
      });

      if (!emailRes.ok) {
        console.error('Failed to send verification email');
        // Continue anyway so the user can land on the verify page and request a resend
      }

      // 4. Save email for verification page and redirect
      sessionStorage.setItem('verify_email', data.email);
      router.push('/verify-email');
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Luxury Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="/images/login-bg.png" 
          alt="Luxury Background" 
          className="w-full h-full object-cover scale-105 animate-pulse-slow"
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-full max-w-md my-8 md:my-12"
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group">
          {/* Subtle light sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6 group/logo">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img src="/images/logo.png" alt="Glossy Logo" className="h-12 md:h-14 mx-auto drop-shadow-lg brightness-0 invert" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[var(--color-rose-gold)] scale-0 group-hover/logo:scale-100 transition-transform" />
              </motion.div>
            </Link>
            <h2 className="text-3xl font-serif text-white tracking-tight mb-2">{t('createAccount')}</h2>
            <p className="text-white/60 text-sm font-light tracking-widest uppercase">{t('eleganceAwaits')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 backdrop-blur-md text-red-200 p-4 rounded-2xl text-xs text-center"
                >
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within/input:text-[var(--color-rose-gold)] transition-colors">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder={tProfile('firstName')}
                    className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                  />
                  {errors.firstName && (
                    <p className="absolute -bottom-4 left-4 text-[10px] text-red-400">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="relative group/input">
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder={tProfile('lastName')}
                    className="w-full bg-white/5 border border-white/10 text-white pl-4 pr-4 py-3.5 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                  />
                  {errors.lastName && (
                    <p className="absolute -bottom-4 left-4 text-[10px] text-red-400">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within/input:text-[var(--color-rose-gold)] transition-colors">
                  <Mail className="h-5 w-5 text-white/40" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t('email')}
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-5 py-3.5 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                />
                {errors.email && (
                  <p className="absolute -bottom-4 left-4 text-[10px] text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Input */}
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within/input:text-[var(--color-rose-gold)] transition-colors">
                  <Phone className="h-5 w-5 text-white/40" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder={tProfile('phone')}
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-5 py-3.5 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                />
                {errors.phone && (
                  <p className="absolute -bottom-4 left-4 text-[10px] text-red-400">{errors.phone.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within/input:text-[var(--color-rose-gold)] transition-colors">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-14 py-3.5 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                  {errors.password && (
                    <p className="absolute -bottom-4 left-4 text-[10px] text-red-400">{errors.password.message}</p>
                  )}
                </div>
  
                {/* Date of Birth Input */}
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within/input:text-[var(--color-rose-gold)] transition-colors">
                    <Gift className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    {...register('birthday')}
                    type="date"
                    placeholder={t('birthday')}
                    className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-5 py-3.5 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm [color-scheme:dark]"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/20 uppercase tracking-widest pointer-events-none">
                    {t('optional')}
                  </div>
                </div>
  
                {/* Confirm Password Input */}
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within/input:text-[var(--color-rose-gold)] transition-colors">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('confirmPassword')}
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-14 py-3.5 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                />
                {errors.confirmPassword && (
                  <p className="absolute -bottom-4 left-4 text-[10px] text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Register Button with Rose Gold Gradient */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full h-14 bg-gradient-to-r from-[#D4AF37] via-[#F5E6CC] to-[#D4AF37] bg-[length:200%_100%] rounded-2xl text-[var(--color-luxury-black)] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[var(--color-rose-gold)]/20 hover:bg-right transition-all duration-700 disabled:opacity-50 disabled:grayscale overflow-hidden mt-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    {t('createAccount')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>

            <div className="text-center pt-2">
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">{t('alreadyMember')}</p>
              <Link href="/login" className="inline-block mt-2 text-white font-medium hover:text-[var(--color-rose-gold)] transition-colors text-sm">
                {t('signIn')}
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] uppercase tracking-widest text-white/30 font-light pb-8 md:pb-0">
          <Link href="/privacy" className="hover:text-white transition-colors">{t('privacyPolicy')}</Link>
          <Link href="/terms" className="hover:text-white transition-colors">{t('termsOfService')}</Link>
          <Link href="/help" className="hover:text-white transition-colors">{t('support')}</Link>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
