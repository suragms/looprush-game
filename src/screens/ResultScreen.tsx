import React, { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { NeonButton } from '@/components/NeonButton';
import { StatCard } from '@/components/StatCard';

export function ResultScreen() {
  const lastResult = useGameStore((s) => s.lastResult);
  const highScore = useGameStore((s) => s.highScore);
  const setScreen = useGameStore((s) => s.setScreen);

  const playAgain = useCallback(() => {
    setScreen('game');
  }, [setScreen]);

  const goHome = useCallback(() => {
    setScreen('home');
  }, [setScreen]);

  const shareScore = useCallback(async () => {
    if (!lastResult) return;
    const text = `🎮 Loop Rush\nScore: ${lastResult.score.toLocaleString()}\nCombo: x${lastResult.highestCombo}\nLevel: ${lastResult.level}\nCan you beat me?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Loop Rush Score', text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [lastResult]);

  if (!lastResult) {
    return (
      <div className="h-full-safe flex items-center justify-center">
        <p className="text-gray-500">No result</p>
      </div>
    );
  }

  const isNew = lastResult.newHighScore;

  return (
    <div className="h-full-safe flex flex-col items-center justify-center px-6 gap-4 safe-t safe-b overflow-y-auto">
      {/* Title */}
      <h2 className="font-display text-3xl font-bold text-white mb-2">
        {isNew ? '🏆 NEW HIGH SCORE!' : 'GAME OVER'}
      </h2>

      {/* Score */}
      <div className="text-center">
        <p className="font-display text-5xl font-black text-neon-cyan">
          {lastResult.score.toLocaleString()}
        </p>
        {isNew && (
          <p className="text-neon-yellow text-sm animate-pulse-glow mt-1">
            Personal Best!
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Best: {highScore.toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4 bg-bg-panel rounded-xl p-4 border border-gray-700/50">
        <StatCard label="Time" value={formatTime(lastResult.survivalSec)} icon="⏱" />
        <StatCard label="Combo" value={`x${lastResult.highestCombo}`} icon="🔥" highlight={lastResult.highestCombo >= 10} />
        <StatCard label="Level" value={lastResult.level} icon="📊" />
        <StatCard label="Energy" value={lastResult.energy} icon="⚡" />
        <StatCard label="Near Miss" value={lastResult.nearMisses} icon="💨" />
        <StatCard label="Level" value={lastResult.level} icon="📈" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
        <NeonButton onClick={playAgain} className="text-xl">
          ▶ PLAY AGAIN
        </NeonButton>
        <NeonButton onClick={shareScore} variant="secondary">
          📤 Share Score
        </NeonButton>
        <NeonButton onClick={goHome} variant="secondary">
          🏠 Home
        </NeonButton>
      </div>
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
