import React, { useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { NeonButton } from '@/components/NeonButton';
import { generateDailyChallenges, todayKey } from '@/game/config/challenges';

export function DailyChallengeScreen() {
  const save = useSettingsStore((s) => s.save);
  const setScreen = useGameStore((s) => s.setScreen);

  const dateKey = useMemo(() => todayKey(), []);
  const challenges = useMemo(() => generateDailyChallenges(dateKey), [dateKey]);
  const completed = save.daily[dateKey] ?? {};

  const allDone = challenges.every((c) => completed[c.id]);

  return (
    <div className="h-full-safe flex flex-col items-center px-6 pt-12 pb-6 safe-t safe-b overflow-y-auto">
      <h2 className="font-display text-2xl font-bold text-white mb-2">📅 Daily Challenge</h2>
      <p className="text-gray-500 text-xs font-body mb-6">{dateKey}</p>

      <div className="w-full max-w-sm space-y-3">
        {challenges.map((ch) => {
          const done = completed[ch.id] ?? false;
          return (
            <div
              key={ch.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                done
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-bg-panel border-gray-700/40'
              }`}
            >
              <span className="text-2xl">{done ? '✅' : '🎯'}</span>
              <div className="flex-1">
                <p className={`font-display text-sm font-bold ${done ? 'text-green-400' : 'text-white'}`}>
                  {ch.title}
                </p>
                <p className="text-xs text-gray-500">{ch.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <p className="text-neon-green text-sm font-display font-bold mt-4 animate-pulse-glow">
          All challenges complete! 🎉
        </p>
      )}

      <div className="flex flex-col gap-3 mt-6">
        <NeonButton onClick={() => setScreen('game')} className="text-lg">
          ▶ Play
        </NeonButton>
        <NeonButton onClick={() => setScreen('home')} variant="secondary">
          ← Back
        </NeonButton>
      </div>
    </div>
  );
}
