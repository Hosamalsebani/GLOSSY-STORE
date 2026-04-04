'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { useLocale } from 'next-intl';

// High-Fidelity 8-Segment Rewards (NiceOne Standard)
const REWARDS = [
  { id: 0, textEn: '%5 OFF', textAr: '%5 خصم', color: '#FFFFFF', textColor: '#111111', weight: 35 },
  { id: 1, textEn: '%10 OFF', textAr: '%10 خصم', color: '#F3E8FF', textColor: '#9333EA', weight: 30 },
  { id: 2, textEn: '%15 OFF', textAr: '%15 خصم', color: '#FFFFFF', textColor: '#111111', weight: 15 },
  { id: 3, textEn: 'GIFT', textAr: 'هدية', color: '#F3E8FF', textColor: '#9333EA', weight: 9 },
  { id: 4, textEn: '%20 OFF', textAr: '%20 خصم', color: '#FFFFFF', textColor: '#111111', weight: 6 },
  { id: 5, textEn: '%30 OFF', textAr: '%30 خصم', color: '#F3E8FF', textColor: '#9333EA', weight: 3 },
  { id: 6, textEn: 'MYSTERY', textAr: 'مفاجأة', color: '#FFFFFF', textColor: '#111111', weight: 1.5 },
  { id: 7, textEn: '%50 OFF', textAr: '%50 خصم', color: '#9333EA', textColor: '#FFFFFF', weight: 0.5 },
];

export default function LuckyWheelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const locale = useLocale();
  const isRtl = locale === 'ar';

  useEffect(() => {
    const lastSpin = localStorage.getItem('glossy_lucky_spin_date');
    const today = new Date().toDateString();
    
    // TEMPORARY: Instant view for verification
    setIsOpen(true);
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    const totalWeight = REWARDS.reduce((acc, r) => acc + r.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let winningIndex = 0;
    for (let i = 0; i < REWARDS.length; i++) {
       if (randomNum < REWARDS[i].weight) {
         winningIndex = i;
         break;
       }
       randomNum -= REWARDS[i].weight;
    }
    const reward = REWARDS[winningIndex];
    
    const segmentAngle = 360 / REWARDS.length;
    const extraRounds = 12 + Math.floor(Math.random() * 6); // High-speed, professional spin
    const targetAngle = extraRounds * 360 + (360 - (winningIndex * segmentAngle)) - (segmentAngle / 2);
    setRotation(targetAngle);

    if (!isMuted) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }

    setTimeout(() => {
      setIsSpinning(false);
      setResult(reward);
      setCouponCode(`GL-${reward.textEn.replace(/[^0-9A-Z]/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
      setShowResult(true);
      localStorage.setItem('glossy_lucky_spin_date', new Date().toDateString());
    }, 6000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-auto">
        {/* Full-Screen Immersive Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="absolute inset-0 bg-[#000000]/80 backdrop-blur-[25px]"
           onClick={() => !isSpinning && setIsOpen(false)}
        />

        {/* Floating Close Button */}
        {!isSpinning && !showResult && (
          <button
            onClick={() => setIsOpen(false)}
            className="fixed top-10 right-10 z-50 p-3 rounded-full bg-white/10 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-95"
            aria-label="Close"
          >
            <X size={28} strokeWidth={1} />
          </button>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center text-center"
        >
          {!showResult ? (
            <>
              {/* Header: Compact & Anchor point */}
              <div className="mb-14 space-y-4">
                 <h2 className={`text-4xl md:text-5xl lg:text-6xl text-white font-serif leading-tight ${isRtl ? 'font-arabic' : 'font-playfair'}`}>
                   {isRtl ? 'لفي العجلة واربحي' : 'Spin to Win'}
                 </h2>
                 <p className={`text-white/40 text-xs md:text-sm uppercase tracking-widest ${isRtl ? 'font-arabic' : 'font-montserrat'}`}>
                   {isRtl ? 'اضغطي للتجربة والحصول على هديتك اليومية' : 'Try your luck and win a special gift'}
                 </p>
              </div>

              {/* The Wheel: Hero Element */}
              <div className="relative mb-16 shadow-[0_0_100px_rgba(147,51,234,0.1)]">
                {/* Pointer: Integrated Triangle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-40">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-white drop-shadow-xl" />
                </div>

                <motion.div
                  className="w-80 h-80 md:w-[450px] md:h-[450px] relative rounded-full border-[8px] border-white/5 overflow-hidden"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 6, ease: [0.12, 0, 0.12, 1] }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {REWARDS.map((reward, i) => {
                      const angle = 360 / REWARDS.length;
                      const x1 = 50 + 50 * Math.cos((Math.PI * i * angle) / 180);
                      const y1 = 50 + 50 * Math.sin((Math.PI * i * angle) / 180);
                      const x2 = 50 + 50 * Math.cos((Math.PI * (i + 1) * angle) / 180);
                      const y2 = 50 + 50 * Math.sin((Math.PI * (i + 1) * angle) / 180);
                      return (
                        <path
                          key={i}
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                          fill={reward.color}
                          stroke="rgba(0,0,0,0.02)"
                          strokeWidth="0.1"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Labels (Fidelity Pattern) */}
                  {REWARDS.map((reward, i) => (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 h-full py-12 md:py-20 text-center pointer-events-none"
                      style={{ 
                        transform: `translateX(-50%) translateY(-100%) rotate(${i * (360/REWARDS.length) + (180/REWARDS.length)}deg)`,
                        transformOrigin: '50% 100%'
                      }}
                    >
                      <span 
                        className={`text-sm md:text-xl font-black leading-none ${isRtl ? 'font-arabic' : 'font-montserrat'}`}
                        style={{ color: reward.textColor }}
                      >
                        {isRtl ? reward.textAr : reward.textEn}
                      </span>
                    </div>
                  ))}
                  
                  {/* The Golden Hub (Branding) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 rounded-full bg-white shadow-2xl flex items-center justify-center z-10 p-2">
                    <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center text-white font-serif italic text-3xl md:text-5xl">
                      G
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full pointer-events-none" />
                  </div>
                </motion.div>
              </div>

              {/* Action: Prominent High-Contrast Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpin}
                disabled={isSpinning}
                className={`w-full max-w-sm h-16 md:h-20 rounded-full flex items-center justify-center gap-4 transition-all font-bold text-sm md:text-lg uppercase tracking-[0.3em] shadow-2xl ${isSpinning ? 'bg-white/10 text-white/30 cursor-wait' : 'bg-[#9333EA] text-white hover:bg-[#7e22ce] shadow-purple-500/20'}`}
              >
                {isSpinning ? (isRtl ? 'جاري السحب...' : 'SPINNING...') : (isRtl ? 'لف العجلة' : 'SPIN THE WHEEL')}
                {!isSpinning && <Sparkles size={20} className="animate-pulse" />}
              </motion.button>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-10 text-[10px] uppercase tracking-[0.5em] text-white/30 hover:text-white transition-all font-bold"
              >
                {isRtl ? 'ربما لاحقاً' : 'SKIP FOR NOW'}
              </button>
            </>
          ) : (
            /* IMMERSIVE WIN STATE */
            <div className="w-full">
              <div className="relative mb-14 flex justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-[#9333EA] to-[#7e22ce] rounded-full flex items-center justify-center shadow-2xl relative"
                >
                  <Gift size={64} className="text-white" />
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                </motion.div>
              </div>

              <div className="space-y-6 mb-14">
                <h3 className="text-xs md:text-sm uppercase tracking-[1em] font-bold text-[#9333EA]">
                  {isRtl ? 'مبروك! لقد فزت بـ' : "YOU'VE WON"}
                </h3>
                <div className={`text-5xl md:text-8xl font-black text-white ${isRtl ? 'font-arabic' : 'font-playfair'}`}>
                  {isRtl ? result.textAr : result.textEn}
                </div>
              </div>

              {/* Unique Coupon Card */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-12 mb-12 shadow-2xl"
              >
                 <div className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold mb-8">
                   {isRtl ? 'كود الخصم الحصري' : 'YOUR EXCLUSIVE CODE'}
                 </div>
                 <div className="text-3xl md:text-5xl font-mono font-bold tracking-[0.4em] text-white mb-10 overflow-hidden">
                   {couponCode}
                 </div>
                 
                 <button
                   onClick={() => {
                        navigator.clipboard.writeText(couponCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                   }}
                   className="w-full h-16 md:h-20 rounded-3xl bg-white text-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-all font-bold text-xs md:text-sm uppercase tracking-[0.4em] shadow-xl"
                 >
                   {copied ? <><Check size={20} /> {isRtl ? 'تم النسخ' : 'COPIED'}</> : <><Copy size={20} /> {isRtl ? 'نسخ الكود' : 'COPY CODE'}</>}
                 </button>
              </motion.div>

              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] uppercase tracking-[0.6em] font-bold text-white/30 hover:text-white transition-all underline underline-offset-8"
              >
                {isRtl ? 'استخدمي الخصم الآن' : 'USE DISCOUNT NOW'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
