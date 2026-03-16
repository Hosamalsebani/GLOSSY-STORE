'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store';
import { Link, useRouter } from '@/i18n/routing';

const loginSchema = z.object({
  identifier: z.string().min(1, { message: 'مطلوب' }),
  password: z.string().min(6, { message: '6 أحرف على الأقل' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'blocked') {
      setAuthError('تم تعليق حسابك. يرجى الاتصال بالدعم.');
    }
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const isEmail = data.identifier.includes('@');
      let loginEmail = data.identifier;
      
      if (!isEmail) {
        loginEmail = `${data.identifier.replace(/[^a-zA-Z0-9]/g, '')}@user.local`;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: data.password,
      });

      if (error) throw error;

      login();

      const { data: adminRecord, error: adminError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', loginEmail)
        .single();

      if (!adminError && adminRecord) {
        router.push('/admin');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      let redirectTo = params.get('redirect');
      
      if (redirectTo) {
        redirectTo = redirectTo.replace(/^\/(en|ar)/, '');
      }

      if (redirectTo && !redirectTo.includes('/admin')) {
        router.push(redirectTo as any);
      } else {
        router.push('/account');
      }
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials')) {
        const isEmail = data.identifier.includes('@');
        if (isEmail) {
          const { data: adminCheck } = await supabase.from('admins').select('email').eq('email', data.identifier).single();
          if (adminCheck) {
            setAuthError('تم العثور على حساب إدارة. يرجى تعيين كلمة المرور الخاصة بك أولاً.');
            return;
          }
        }
        setAuthError('بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.');
      } else {
        setAuthError(error.message || 'فشلت عملية المصادقة.');
      }
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
        className="relative z-30 w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group">
          {/* Subtle light sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6 group/logo">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img src="/images/logo.png" alt="Glossy Logo" className="h-12 md:h-14 mx-auto drop-shadow-lg brightness-0 invert" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[var(--color-rose-gold)] scale-0 group-hover/logo:scale-100 transition-transform" />
              </motion.div>
            </Link>
            <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-white/60 text-sm font-light tracking-widest uppercase">Elegance awaits you</p>
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

            <div className="space-y-4">
              {/* Identifier Input */}
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within/input:text-[var(--color-rose-gold)] transition-colors">
                  <User className="h-5 w-5 text-white/40" />
                </div>
                <input
                  {...register('identifier')}
                  type="text"
                  placeholder="البريد الإلكتروني أو الهاتف"
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-5 py-4 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                  suppressHydrationWarning
                />
                {errors.identifier && (
                  <p className="absolute -bottom-5 left-4 text-[10px] text-red-400">{errors.identifier.message}</p>
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
                  placeholder="كلمة المرور"
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-14 py-4 rounded-2xl outline-none focus:border-[var(--color-rose-gold)]/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="absolute -bottom-5 left-4 text-[10px] text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group/check">
                <div className="relative w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover/check:border-[var(--color-rose-gold)] transition-colors">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-2 h-2 rounded-sm bg-[var(--color-rose-gold)] scale-0 peer-checked:scale-100 transition-transform" />
                </div>
                <span className="text-xs text-white/60 tracking-wider">تذكرني</span>
              </label>
              <Link href="/forgot-password" className="text-xs text-[var(--color-rose-gold)] hover:text-white transition-colors tracking-wider">
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Login Button with Rose Gold Gradient */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full h-14 bg-gradient-to-r from-[#D4AF37] via-[#F5E6CC] to-[#D4AF37] bg-[length:200%_100%] rounded-2xl text-[var(--color-luxury-black)] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[var(--color-rose-gold)]/20 hover:bg-right transition-all duration-700 disabled:opacity-50 disabled:grayscale overflow-hidden"
              suppressHydrationWarning
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>تسجيل الدخول <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </motion.button>

            <div className="text-center pt-4">
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">جديد على Glossy؟</p>
              <Link href="/register" className="inline-block mt-2 text-white font-medium hover:text-[var(--color-rose-gold)] transition-colors text-sm">
                إنشاء حساب جديد
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] uppercase tracking-widest text-white/30 font-light">
          <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-white transition-colors">شروط الخدمة</Link>
          <Link href="/help" className="hover:text-white transition-colors">الدعم الفني</Link>
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
