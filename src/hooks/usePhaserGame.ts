import { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import { BootScene } from '@/game/scenes/BootScene';
import { PreloadScene } from '@/game/scenes/PreloadScene';
import { GameScene } from '@/game/scenes/GameScene';
import { HUDScene } from '@/game/scenes/HUDScene';
import { GAME_CONFIG } from '@/game/config/constants';

let _gameInstance: Phaser.Game | null = null;

/**
 * Hook to create / destroy the Phaser game instance.
 * The game canvas is mounted inside the returned ref container.
 */
export function usePhaserGame(containerRef: React.RefObject<HTMLDivElement | null>) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const isCreated = useRef(false);

  const createGame = useCallback(() => {
    if (isCreated.current || !containerRef.current) return;
    isCreated.current = true;

    const parent = containerRef.current;

    const w = GAME_CONFIG.ARENA_WIDTH;
    const h = GAME_CONFIG.ARENA_HEIGHT;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent,
      width: w,
      height: h,
      backgroundColor: '#07070f',
      physics: GAME_CONFIG.physics,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true,
        // Limit resolution on high-DPI
        antialiasGL: true,
    },
      input: {
        activePointers: 3,
        touch: {
          capture: true,
        },
      },
      scene: [
        BootScene,
        PreloadScene,
        GameScene,
        new HUDScene(w, h),
      ],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    _gameInstance = game;

    // Start
    game.scene.start('BootScene');
  }, [containerRef]);

  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
      _gameInstance = null;
      isCreated.current = false;
    }
  }, []);

  useEffect(() => {
    // Small delay to let the container render
    const t = requestAnimationFrame(() => {
      createGame();
    });
    return () => {
      cancelAnimationFrame(t);
      destroyGame();
    };
  }, [createGame, destroyGame]);

  const getGameScene = useCallback((): GameScene | null => {
    if (!_gameInstance) return null;
    const s = _gameInstance.scene.getScene('GameScene');
    return s instanceof GameScene ? s : null;
  }, []);

  return { createGame, destroyGame, getGameScene };
}
