"use client";

import React, { useState } from "react";
import RewardsSystem from "@/components/rewards/RewardsSystem";

export default function RewardsDemoPage() {
  const [resetCount, setResetCount] = useState(0);

  const resetLocalStorage = () => {
    localStorage.removeItem("glossy_last_played");
    setResetCount((prev) => prev + 1);
    // Setting key to force re-render/re-mount of the RewardsSystem to recheck localstorage
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
          Glossy Interactive Rewards System
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          Experience the premium, high-fidelity gamification layer built for the Glossy platform. 
          A floating gift icon appears in the bottom left if the user is eligible to play.
        </p>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Developer Controls</h2>
          <p className="text-sm text-zinc-500 mb-6">
            The rewards system strictly enforces a "Once a day" play limit using localStorage. 
            Use the button below to clear the lock and test again.
          </p>
          <button
            onClick={resetLocalStorage}
            className="px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full font-medium hover:scale-105 active:scale-95 transition-all"
          >
            Reset Daily Limitation Lock
          </button>
        </div>
      </div>

      {/* Rewards System instance keyed by reset count to force remount on reset */}
      <RewardsSystem key={resetCount} />
      
    </div>
  );
}
