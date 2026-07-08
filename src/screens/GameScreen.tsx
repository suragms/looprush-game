import { useRef, useCallback } from 'react';
import { usePhaserGame } from '@/hooks/usePhaserGame';

export function GameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getGameScene } = usePhaserGame(containerRef);

  // External DASH button handler
  const onDash = useCallback(() => {
    getGameScene()?.fireExternalDash();
  }, [getGameScene]);

  // External pause button handler
  const onPause = useCallback(() => {
    getGameScene()?.pauseGame();
  }, [getGameScene]);

  // If we navigated away, the Phaser instance will be destroyed by the hook cleanup.
  return (
    <div className="h-full-safe w-full relative flex flex-col items-center justify-center bg-bg-deep">
      {/* Phaser Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Mobile DASH button — bottom right, safe area */}
      <button
        className="absolute bottom-6 right-6 safe-b safe-r z-50 w-16 h-16 rounded-full
          bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan font-display text-xs font-bold
          flex items-center justify-center active:scale-90 transition-transform
          shadow-neon"
        onTouchStart={(e) => {
          e.preventDefault();
          onDash();
        }}
        onClick={onDash}
        aria-label="Dash"
      >
        DASH
      </button>

      {/* Pause button — top left */}
      <button
        className="absolute top-4 left-4 safe-t safe-l z-50 w-10 h-10 rounded-lg
          bg-bg-panel/60 border border-gray-600 text-white font-body text-lg
          flex items-center justify-center active:scale-90 transition-transform"
        onClick={onPause}
        aria-label="Pause"
      >
        ⏸
      </button>
    </div>
  );
}
