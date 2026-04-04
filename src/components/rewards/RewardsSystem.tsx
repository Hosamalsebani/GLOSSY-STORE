"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices } from "lucide-react";

import SlotMachine from "./SlotMachine";
import RewardPopup from "./RewardPopup";

export default function RewardsSystem() {
  const [activeGame, setActiveGame] = useState<"none" | "slots">("none");
  
  // Results
  const [showPopup, setShowPopup] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [rewardText, setRewardText] = useState("");

  const [canPlay, setCanPlay] = useState(true);

  // Check LocalStorage on Mount
  useEffect(() => {
    const lastPlayed = localStorage.getItem("glossy_last_played");
    if (lastPlayed) {
      const parsedDate = new Date(lastPlayed);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - parsedDate.getTime()) / 36e5;
      if (diffInHours < 24) {
        setCanPlay(false);
      }
    }
  }, []);

  const setPlayed = () => {
    localStorage.setItem("glossy_last_played", new Date().toISOString());
    setCanPlay(false);
  };

  const handleGameComplete = (reward: string, win: boolean) => {
    setPlayed();
    setRewardText(reward);
    setIsWin(win);
    setActiveGame("none");
    setShowPopup(true);
  };

  const closeEverything = () => {
    setActiveGame("none");
    setShowPopup(false);
  };

  return (
    <>
      <AnimatePresence>
        {activeGame === "none" && !showPopup && canPlay && (
          <motion.button
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveGame("slots")}
            className="fixed bottom-6 left-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-[0_0_20px_rgba(255,20,147,0.5)] md:bottom-10 md:left-10 group"
          >
            <Dices size={28} className="group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeGame === "slots" && (
          <SlotMachine 
            onClose={() => setActiveGame("none")} 
            onComplete={handleGameComplete} 
          />
        )}
      </AnimatePresence>

      <RewardPopup 
        isOpen={showPopup}
        isWin={isWin}
        rewardText={rewardText}
        onClose={closeEverything}
      />
    </>
  );
}
