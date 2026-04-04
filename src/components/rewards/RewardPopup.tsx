"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2, XCircle } from "lucide-react";

interface RewardPopupProps {
  isOpen: boolean;
  isWin: boolean;
  rewardText: string;
  onClose: () => void;
}

export default function RewardPopup({ isOpen, isWin, rewardText, onClose }: RewardPopupProps) {
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    if (isOpen && isWin) {
      // Generate a random 8-character coupon code starting with GLOSSY
      const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
      setCouponCode(`GLOSSY${randomString}`);
      setCopied(false);
    }
  }, [isOpen, isWin]);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple custom confetti elements
  const confettiPieces = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    color: ["#ff4081", "#ffffff", "#ffd700", "#ff79a1"][Math.floor(Math.random() * 4)],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.5 + 1.5,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          {isWin && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  initial={{ y: -50, opacity: 1, rotate: 0 }}
                  animate={{ y: "100vh", opacity: 0, rotate: 360 }}
                  transition={{
                    duration: piece.duration,
                    delay: piece.delay,
                    ease: "easeOut",
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: piece.color,
                    left: piece.left,
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-[32px] border border-white/20 bg-white/70 p-8 text-center shadow-[0_8px_32px_rgba(255,64,129,0.15)] backdrop-blur-xl dark:bg-zinc-900/80"
          >
            {isWin ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30"
                >
                  <span className="text-4xl">🎉</span>
                </motion.div>
                <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">Congratulations!</h2>
                <p className="mb-6 text-zinc-600 dark:text-zinc-300">You won {rewardText}</p>

                <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/50 p-4 shadow-inner dark:bg-black/20">
                  <span className="font-mono text-xl font-bold tracking-wider text-pink-600 dark:text-pink-400">
                    {couponCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white transition-colors hover:bg-pink-600 active:scale-95"
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
                >
                  <span className="text-4xl">😅</span>
                </motion.div>
                <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">Hard Luck!</h2>
                <p className="mb-6 text-zinc-600 dark:text-zinc-300">Try again tomorrow for another chance to win.</p>
              </>
            )}

            <button
              onClick={onClose}
              className="w-full rounded-full bg-zinc-900 py-4 font-semibold text-white transition-transform hover:bg-black active:scale-95 dark:bg-white dark:text-black"
            >
              Back to Store
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
