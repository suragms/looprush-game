import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { NeonButton } from '@/components/NeonButton';
import { StatCard } from '@/components/StatCard';

export function StatsScreen() {
  const stats = useSettingsStore((s) => s.save.stats);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="h-full-safe flex flex-col items-center px-6 pt-12 pb-6 safe-t safe-b overflow-y-auto">
      <h2 className="font-display text-2xl font-bold text-white mb-6">📊 Statistics</h2>

      <div className="w-full max-w-sm bg-bg-panel rounded-xl border border-gray-700/50 p-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="High Score" value={stats.highScore} icon="🏆" highlight />
          <StatCard label="Games Played" value={stats.gamesPlayed} icon="🎮" />
          <StatCard label="Total Time" value={formatTime(stats.totalSurvivalSec)} icon="⏱" />
          <StatCard label="Best Combo" value={`x${stats.highestCombo}`} icon="🔥" highlight={stats.highestCombo >= 10} />
          <StatCard label="Max Level" value={stats.maxLevel} icon="📈" />
          <StatCard label="Total Energy" value={stats.totalEnergy} icon="⚡" />
          <StatCard label="Near Misses" value={stats.nearMisses} icon="💨" />
          <StatCard label="Dash Dodges" value={stats.dashDodges} icon="💨" />
        </div>
      </div>

      <NeonButton onClick={() => setScreen('home')} variant="secondary" className="mt-6">
        ← Back
      </NeonButton>
    </div>
  );
}

function formatTime(sec: number): string {
  if (sec < 60) return `${Math.floor(sec)}s`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
