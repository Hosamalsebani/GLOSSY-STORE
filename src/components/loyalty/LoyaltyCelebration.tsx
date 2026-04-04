'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Gift } from 'lucide-react';

interface LoyaltyCelebrationProps {
  points: number;
}

export default function LoyaltyCelebration({ points }: LoyaltyCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [particleProps, setParticleProps] = useState<any[]>([]);

  useEffect(() => {
    setHasMounted(true);
    // Generate stable random properties for particles on the client only
    const props = [...Array(24)].map(() => ({
      xRandom: (Math.random() - 0.5) * 600,
      yRandom: (Math.random() - 0.5) * 600,
      rotateRandom: Math.random() * 360,
      durationRandom: 2 + Math.random(),
      starSize: 12 + Math.random() * 12,
      dotWidth: 8 + Math.random() * 10,
      dotHeight: 8 + Math.random() * 10
    }));
    setParticleProps(props);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000); // 4 seconds total to allow for smooth exit
    return () => clearTimeout(timer);
  }, []);

  if (points <= 0 || !hasMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Backdrop Blur Bloom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/10 backdrop-blur-sm"
          />

          {/* Particles Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            {particleProps.map((prop, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: prop.xRandom,
                  y: prop.yRandom,
                  scale: [0, 1, 0.5],
                  opacity: [1, 1, 0],
                  rotate: prop.rotateRandom,
                }}
                transition={{
                  duration: prop.durationRandom,
                  ease: "easeOut",
                  delay: 0.2,
                }}
                className="absolute"
              >
                {i % 3 === 0 ? (
                  <Star className="text-[var(--color-rose-gold)] fill-current" size={prop.starSize} />
                ) : (
                  <div 
                    className={`rounded-full ${i % 2 === 0 ? 'bg-[var(--color-luxury-black)]' : 'bg-[var(--color-rose-gold)]'}`} 
                    style={{ width: prop.dotWidth, height: prop.dotHeight }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Main Celebration Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative bg-white border-2 border-[var(--color-rose-gold)] p-8 md:p-12 shadow-2xl flex flex-col items-center gap-6 max-w-sm w-[90%]"
          >
            {/* Glowing Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-dashed border-[var(--color-rose-gold)]/30 rounded-full scale-125 pointer-events-none"
            />

            <div className="w-20 h-20 bg-[var(--color-rose-gold)] rounded-full flex items-center justify-center shadow-lg transform -translate-y-2">
              <Trophy className="text-white" size={40} />
            </div>

            <div className="text-center">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-serif text-[var(--color-luxury-black)] mb-2"
              >
                Upcoming Rewards!
              </motion.h2>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-4xl font-bold bg-gradient-to-r from-[var(--color-luxury-black)] to-[var(--color-rose-gold)] bg-clip-text text-transparent">
                  +{points}
                </span>
                <span className="text-lg uppercase tracking-widest text-gray-500 font-medium">Points</span>
              </motion.div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 text-xs text-center leading-relaxed"
            >
              Points will be added to your balance <br />
              <span className="font-semibold text-[var(--color-rose-gold)] uppercase tracking-tighter">after order approval</span>
            </motion.p>

            {/* Sparkle icons */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4 text-[var(--color-rose-gold)]"
            >
              <Star size={32} fill="currentColor" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 text-[var(--color-luxury-black)]"
            >
              <Gift size={32} fill="currentColor" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
