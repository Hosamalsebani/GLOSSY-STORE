"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface SpinWheelProps {
  onComplete: (reward: string, isWin: boolean) => void;
  onClose: () => void;
}

const SEGMENTS = [
  { id: 0, label: "5% OFF" },
  { id: 1, label: "15% OFF" },
  { id: 2, label: "10% OFF" },
  { id: 3, label: "FREE SHIP" },
  { id: 4, label: "5% OFF" },
  { id: 5, label: "50% OFF" },
];

export default function SpinWheel({ onComplete, onClose }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const r = Math.random();
    let winningSegmentIndex = 0;

    if (r < 0.7) {
      winningSegmentIndex = Math.random() < 0.5 ? 0 : 2; // 5% or 10%
    } else if (r < 0.9) {
      winningSegmentIndex = 1; // 15%
    } else if (r < 0.99) {
      winningSegmentIndex = 3; // Free shipping
    } else {
      winningSegmentIndex = 5; // 50% OFF
    }

    const segmentAngle = 360 / SEGMENTS.length;
    const offset = 360 - winningSegmentIndex * segmentAngle;
    const jitter = Math.floor(Math.random() * (segmentAngle - 10)) - (segmentAngle - 10) / 2;

    const totalRotation = rotation + (360 * 6) + offset + jitter - (rotation % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onComplete(SEGMENTS[winningSegmentIndex].label, true);
    }, 6000); 
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => !isSpinning && onClose()}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        
        {/* Close Button */}
        <button 
          onClick={() => !isSpinning && onClose()}
          className="absolute -right-4 -top-12 sm:-right-12 sm:-top-12 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffdf8a] to-[#d4af37] drop-shadow-sm">
            Glossy Fortune
          </h2>
          <p className="text-pink-100 font-medium tracking-wide mt-1">
            Tap to reveal your beauty reward
          </p>
        </div>

        {/* Glow behind the wheel */}
        <div className="absolute top-[120px] h-[300px] w-[300px] rounded-full bg-[#ff4081] opacity-30 blur-[80px]" />

        <div className="relative flex items-center justify-center h-72 w-72 md:h-80 md:w-80">
          
          {/* Pointer Outer (Gold wrapper) */}
          <div className="absolute left-1/2 top-[-25px] z-30 h-14 w-12 -translate-x-1/2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 50L0 20C0 8.954 8.954 0 20 0C31.046 0 40 8.954 40 20L20 50Z" fill="url(#pointerGrad)" />
              <path d="M20 45L4 20C4 11.163 11.163 4 20 4C28.837 4 36 11.163 36 20L20 45Z" fill="#ff4081" />
              <defs>
                <linearGradient id="pointerGrad" x1="0" y1="0" x2="40" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F9D423"/>
                  <stop offset="1" stopColor="#FF4E50"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Golden Outer Rim */}
          <div className="absolute inset-[-15px] rounded-full bg-gradient-to-tr from-[#c59e3e] via-[#f7d070] to-[#b38b22] p-2 shadow-2xl flex items-center justify-center">
             {/* Rim lights decoration */}
             <div className="absolute inset-1 rounded-full border border-yellow-200/50"></div>
             {Array.from({ length: 12 }).map((_, i) => (
               <div
                 key={i}
                 className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_8px_#fff]"
                 style={{
                   transform: `rotate(${i * 30}deg) translateY(-165px)`,
                 }}
               />
             ))}
          </div>

          <motion.div
            className="relative h-full w-full rounded-full overflow-hidden border-4 border-white/90 bg-white shadow-inner"
            animate={{ rotate: rotation }}
            transition={{
              duration: 6,
              ease: [0.15, 0.9, 0.25, 1], // Very snappy start, extremely long slide out
            }}
          >
            {/* Using CSS conic-gradient for beautiful crisp segments instead of SVG arcs */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
                  #ff4081 0deg 60deg, 
                  #fff0f5 60deg 120deg, 
                  #ff79a1 120deg 180deg, 
                  #fff0f5 180deg 240deg, 
                  #ff4081 240deg 300deg, 
                  #fff0f5 300deg 360deg
                )`
              }}
            />

            {/* Separator lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={`line-${i}`}
                className="absolute inset-x-0 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-50"
                style={{ transform: `rotate(${i * 60}deg)` }}
              />
            ))}

            {/* Text items mapped circularly */}
            {SEGMENTS.map((segment, index) => {
              const rotationAngle = index * 60 + 30; // center of each 60deg segment
              const isDarkCell = index === 0 || index === 2 || index === 4; 
              
              return (
                <div
                  key={segment.id}
                  className="absolute inset-0 flex items-start justify-center pt-8"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <span 
                    className={`text-lg font-black tracking-wider shadow-sm drop-shadow-md ${
                      isDarkCell ? 'text-white' : 'text-[#ff4081]'
                    }`}
                    style={{ transform: "rotate(180deg)", writingMode: "vertical-rl", textOrientation: "mixed" }}
                  >
                    {segment.label}
                  </span>
                </div>
              );
            })}
            
            {/* Center Cap layered for 3D effect */}
            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#f7d070] bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-center">
               <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#ff4081] to-[#c71585] shadow-inner flex items-center justify-center">
                 <span className="text-2xl font-black text-white italic drop-shadow-md tracking-tighter">
                   GL
                 </span>
               </div>
            </div>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSpinning}
          onClick={spin}
          className="mt-16 w-full max-w-[250px] rounded-full bg-gradient-to-r from-[#d4af37] to-[#F9D423] p-[2px] shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all"
        >
          <div className="w-full rounded-full bg-black hover:bg-zinc-900 py-4 px-6 transition-colors flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F9D423] to-[#fff]">
              {isSpinning ? "SPINNING..." : "SPIN TO WIN"}
            </span>
          </div>
        </motion.button>
        
      </div>
    </motion.div>
  );
}
