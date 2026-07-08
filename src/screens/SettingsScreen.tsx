import React, { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { Toggle } from '@/components/Toggle';
import { NeonButton } from '@/components/NeonButton';

export function SettingsScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const setScreen = useGameStore((s) => s.setScreen);

  const toggle = useCallback(
    (key: keyof typeof settings, val: boolean) => {
      setSettings({ [key]: val });
    },
    [setSettings],
  );

  return (
    <div className="h-full-safe flex flex-col items-center px-6 pt-12 pb-6 safe-t safe-b overflow-y-auto">
      <h2 className="font-display text-2xl font-bold text-white mb-6">⚙ Settings</h2>

      <div className="w-full max-w-sm bg-bg-panel rounded-xl border border-gray-700/50 divide-y divide-gray-700/30">
        <Toggle label="Music" checked={settings.music} onChange={(v) => toggle('music', v)} />
        <Toggle label="Sound Effects" checked={settings.sfx} onChange={(v) => toggle('sfx', v)} />

        {/* Volume slider */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-white font-body text-base">Volume</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            onChange={(e) => setSettings({ volume: Number(e.target.value) / 100 })}
            className="w-32 h-1.5 rounded-full appearance-none bg-gray-600 accent-neon-cyan cursor-pointer"
            aria-label="Volume"
          />
          <span className="text-gray-400 text-xs w-8 text-right">
            {Math.round(settings.volume * 100)}%
          </span>
        </div>

        <Toggle label="Screen Shake" checked={settings.screenShake} onChange={(v) => toggle('screenShake', v)} />
        <Toggle label="Reduced Motion" checked={settings.reducedMotion} onChange={(v) => toggle('reducedMotion', v)} />
        <Toggle label="High Contrast" checked={settings.highContrast} onChange={(v) => toggle('highContrast', v)} />

        {/* Graphics quality */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-white font-body text-base">Graphics</span>
          <div className="flex gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((g) => (
              <button
                key={g}
                className={`px-3 py-1 rounded text-xs font-display font-bold transition-colors ${
                  settings.graphics === g
                    ? 'bg-neon-cyan/30 text-neon-cyan border border-neon-cyan'
                    : 'bg-gray-700/30 text-gray-400 border border-gray-600'
                }`}
                onClick={() => setSettings({ graphics: g })}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <NeonButton onClick={() => setScreen('home')} variant="secondary" className="mt-6">
        ← Back
      </NeonButton>
    </div>
  );
}
