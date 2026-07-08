import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { NeonButton } from '@/components/NeonButton';

export function HomeScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const highScore = useGameStore((s) => s.highScore);

  return (
    <div className="h-full-safe flex flex-col items-center justify-center px-6 gap-6 safe-t safe-b">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <h1 className="font-display text-5xl font-black text-neon-cyan tracking-wider animate-pulse-glow">
          LOOP
        </h1>
        <h1 className="font-display text-5xl font-black text-neon-magenta tracking-wider">
          RUSH
        </h1>
        <p className="text-gray-400 font-body text-sm tracking-widest uppercase">
          Neon Arcade Survival
        </p>
      </div>

      {/* High Score */}
      <div className="text-center mb-2">
        <p className="text-gray-500 text-xs uppercase tracking-wider font-body">
          Best Score
        </p>
        <p className="font-display text-3xl font-bold text-neon-yellow">
          {highScore.toLocaleString()}
        </p>
      </div>

      {/* PLAY */}
      <NeonButton onClick={() => setScreen('game')} className="text-2xl px-12 py-4">
        ▶ PLAY
      </NeonButton>

      {/* Daily Challenge */}
      <NeonButton
        onClick={() => setScreen('daily')}
        variant="secondary"
        className="text-base px-8"
      >
        📅 Daily Challenge
      </NeonButton>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-xs">
        <NeonButton onClick={() => setScreen('achievements')} variant="secondary" className="text-sm px-4 py-2">
          🏆 Achievements
        </NeonButton>
        <NeonButton onClick={() => setScreen('customize')} variant="secondary" className="text-sm px-4 py-2">
          🎨 Customize
        </NeonButton>
        <NeonButton onClick={() => setScreen('stats')} variant="secondary" className="text-sm px-4 py-2">
          📊 Statistics
        </NeonButton>
        <NeonButton onClick={() => setScreen('settings')} variant="secondary" className="text-sm px-4 py-2">
          ⚙ Settings
        </NeonButton>
      </div>

      <p className="text-gray-600 text-xs font-body mt-4">
        Survive · Collect · Combo · Repeat
      </p>
    </div>
  );
}
