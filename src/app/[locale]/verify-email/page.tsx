'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Mail, Loader2, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';

export default function VerifyEmailPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const supabase = createClient();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from sessionStorage or from current auth user
    const storedEmail = sessionStorage.getItem('verify_email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Try to get from current session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setEmail(user.email);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    // Focus the input after the last pasted digit
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError(t('completeCode'));
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Fetch the user's stored custom OTP
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id, custom_otp')
        .eq('email', email)
        .single();

      if (fetchError || !userData) {
         throw new Error('User not found or unable to verify.');
      }

      if (userData.custom_otp !== code) {
        throw new Error('رمز التحقق غير صحيح أو منتهي الصلاحية'); // Invalid OTP message
      }

      // Mark user as verified and clear the OTP
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
           is_verified: true,
           custom_otp: null // Clear OTP after successful use
        })
        .eq('id', userData.id);

      if (updateError) throw updateError;

      setSuccess(true);
      sessionStorage.removeItem('verify_email');

      // Redirect to account after a brief success animation
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('verificationFailedFallback'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setIsResending(true);
    setError(null);

    try {
      // Generate a new 6-digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Update the user's record with the new OTP
      const { error: updateError } = await supabase
        .from('users')
        .update({ custom_otp: newOtp })
        .eq('email', email);

      if (updateError) throw updateError;

      // Send the stylized OTP email via Resend
      const emailRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otp: newOtp
        })
      });

      if (!emailRes.ok) {
         throw new Error('Failed to send verification email');
      }

      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || t('resendFailed'));
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img src="/images/login-bg.png" alt="Background" className="w-full h-full object-cover scale-105 animate-pulse-slow" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-20" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-30 w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[2.5rem] p-8 md:p-12 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-[var(--color-rose-gold)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-[var(--color-rose-gold)]" />
          </div>
          <h2 className="text-3xl font-serif text-white">{t('verificationSuccess')}</h2>
          <p className="text-white/60 text-sm font-light uppercase tracking-widest">{t('eleganceIsYours')}</p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-rose-gold)]" />
          </div>
        </motion.div>
      </div>
    );
  }

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
        transition={{ duration: 0.8 }}
        className="relative z-30 w-full max-w-md"
      >
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative group h-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
              <Mail className="w-10 h-10 text-[var(--color-rose-gold)]" />
            </div>
            <h2 className="text-3xl font-serif text-white tracking-tight mb-2">
              {t('checkEmail')}
            </h2>
            <p className="text-white/60 text-sm font-light tracking-widest uppercase">
              {t('verificationSent')}
            </p>
            {email && (
              <p className="mt-2 text-sm font-medium text-[var(--color-rose-gold)]">{email}</p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 backdrop-blur-md text-red-200 p-4 rounded-2xl text-xs text-center mb-6"
              >
                {t('verificationFailed')}
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-8 direction-ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`Digit ${index + 1}`}
                className={`w-11 h-14 text-center text-xl font-bold bg-white/5 border-2 rounded-xl transition-all outline-none text-white
                  ${digit ? 'border-[var(--color-rose-gold)] bg-white/10' : 'border-white/10'}
                  focus:border-[var(--color-rose-gold)] focus:ring-4 focus:ring-[var(--color-rose-gold)]/20`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
            className="group relative w-full h-14 bg-gradient-to-r from-[#D4AF37] via-[#F5E6CC] to-[#D4AF37] bg-[length:200%_100%] rounded-2xl text-[var(--color-luxury-black)] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[var(--color-rose-gold)]/20 hover:bg-right transition-all duration-700 disabled:opacity-50 disabled:grayscale overflow-hidden mb-8"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isVerifying ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                t('verifyEmail')
              )}
            </span>
          </motion.button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-[var(--color-rose-gold)] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0
                ? t('resendIn', { seconds: resendCooldown })
                : isResending
                  ? '...'
                  : t('resendCode')
              }
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/register" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              <ArrowLeft size={12} /> {t('backToRegister')}
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] uppercase tracking-widest text-white/30 font-light">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/help" className="hover:text-white transition-colors">Support</Link>
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
        .direction-ltr {
          direction: ltr;
        }
      `}</style>
    </div>
  );
}
