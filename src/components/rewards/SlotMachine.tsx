"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SlotMachineProps {
  onComplete: (reward: string, isWin: boolean) => void;
  onClose: () => void;
}

const BASE_ICONS = ["💄", "🧴", "🌸"];
const REWARD_MAP: Record<string, string> = {
  "💄": "10% OFF",
  "🧴": "5% OFF",
  "🌸": "Free Shipping",
};

// Generate a long list of icons to simulate the spinning reel
const generateReel = (targetIcon: string) => {
  const reel = [];
  // Add 30 random icons
  for (let i = 0; i < 30; i++) {
    reel.push(BASE_ICONS[Math.floor(Math.random() * BASE_ICONS.length)]);
  }
  // Ensure the target icon is at a specific final position
  // We'll stop the animation at index 2 (from bottom or top based on logic)
  reel.unshift(targetIcon); 
  reel.unshift(BASE_ICONS[Math.floor(Math.random() * BASE_ICONS.length)]);
  reel.unshift(BASE_ICONS[Math.floor(Math.random() * BASE_ICONS.length)]);
  return reel;
};

export default function SlotMachine({ onComplete, onClose }: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([[], [], []]);
  const [resultReels, setResultReels] = useState<string[]>(["🌸", "💄", "🧴"]); // Initial visual

  useEffect(() => {
    // Generate initial static reels just for display before spin
    setReels([
      generateReel(resultReels[0]),
      generateReel(resultReels[1]),
      generateReel(resultReels[2]),
    ]);
  }, []);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const isWin = Math.random() < 0.15; // 15% win chance
    let finalIcons = ["", "", ""];

    if (isWin) {
      const winningIcon = BASE_ICONS[Math.floor(Math.random() * BASE_ICONS.length)];
      finalIcons = [winningIcon, winningIcon, winningIcon];
    } else {
      // Ensure it's a loss (not all 3 the same)
      do {
        finalIcons = [
          BASE_ICONS[Math.floor(Math.random() * BASE_ICONS.length)],
          BASE_ICONS[Math.floor(Math.random() * BASE_ICONS.length)],
          BASE_ICONS[Math.floor(Math.random() * BASE_ICONS.length)],
        ];
      } while (finalIcons[0] === finalIcons[1] && finalIcons[1] === finalIcons[2]);
    }

    setResultReels(finalIcons);
    setReels([
      generateReel(finalIcons[0]),
      generateReel(finalIcons[1]),
      generateReel(finalIcons[2]),
    ]);

    // Calculate when the staggered animation is done (reel 3 finishes last ~ 3.5s)
    setTimeout(() => {
      setIsSpinning(false);
      onComplete(isWin ? REWARD_MAP[finalIcons[0]] : "", isWin);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Glossy Slots</h2>
          <p className="text-zinc-400 mt-2">Match 3 to win an exclusive reward!</p>
        </div>

        <div className="relative p-6 rounded-[40px] bg-white/10 shadow-[0_0_50px_rgba(255,64,129,0.2)] border border-white/20 backdrop-blur-md w-full">
          {/* Machine inner */}
          <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-3xl inner-shadow gap-4 overflow-hidden">
            {reels.map((reel, i) => (
              <div 
                key={i} 
                className="w-1/3 h-32 bg-white/90 rounded-2xl overflow-hidden relative shadow-inner border border-white/30 flex justify-center"
              >
                {/* Gradient overlays to simulate cylinder */}
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent z-10" />

                <motion.div
                  className="absolute flex flex-col pt-[calc(64px-1.5rem)]" // center align hack
                  initial={{ y: 0 }}
                  animate={isSpinning ? { y: -((reel.length - 3) * 80) } : { y: 0 }}
                  transition={{ 
                    duration: 2 + i * 0.5, // 2s, 2.5s, 3.0s staggered
                    ease: [0.2, 0.8, 0.2, 1], // Custom easing to simulate slow down
                  }}
                >
                  {reel.map((icon, index) => (
                    <div 
                      key={index} 
                      className="h-20 w-full flex items-center justify-center text-4xl sm:text-5xl"
                    >
                      <span className="drop-shadow-lg">{icon}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>

          <motion.div 
            className="w-full flex justify-center mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              disabled={isSpinning}
              onClick={spin}
              className="w-full sm:w-2/3 rounded-full py-4 text-lg font-bold text-white shadow-lg transition-all disabled:opacity-50 
                bg-gradient-to-r from-pink-500 hover:from-pink-400 to-rose-500 hover:to-rose-400
                hover:shadow-[0_0_20px_rgba(255,20,147,0.5)] border border-pink-400/50"
            >
              {isSpinning ? "SPINNING..." : "PULL TO SPIN"}
            </button>
          </motion.div>
        
        </div>

        <button 
          className="mt-8 text-sm text-white/50 hover:text-white underline underline-offset-4 transition-colors"
          onClick={() => !isSpinning && onClose()}
        >
          Maybe next time
        </button>

      </div>
    </motion.div>
  );
}
