import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { NeonButton } from '@/components/NeonButton';
import { equipCosmetics } from '@/storage/saveManager';
import { ORB_COSMETICS, THEME_COSMETICS, TRAIL_COSMETICS, DASH_COSMETICS } from '@/game/config/theme';
import type { CosmeticSlot } from '@/types';

const SECTIONS: Array<{ slot: CosmeticSlot; label: string; items: Array<{ id: string; name: string; preview?: string }> }> = [
  { slot: 'orb', label: 'Orb', items: ORB_COSMETICS.map((o) => ({ id: o.id, name: o.name })) },
  { slot: 'trail', label: 'Trail', items: TRAIL_COSMETICS.map((t) => ({ id: t.id, name: t.name })) },
  { slot: 'dash', label: 'Dash', items: DASH_COSMETICS.map((d) => ({ id: d.id, name: d.name })) },
  { slot: 'theme', label: 'Theme', items: THEME_COSMETICS.map((t) => ({ id: t.id, name: t.name })) },
];

export function CustomizeScreen() {
  const save = useSettingsStore((s) => s.save);
  const refreshSave = useSettingsStore((s) => s.refreshSave);
  const setScreen = useGameStore((s) => s.setScreen);

  const owned = save.cosmetics.owned;
  const equipped = save.cosmetics.equipped;

  const handleEquip = (slot: CosmeticSlot, id: string) => {
    equipCosmetics({ [slot]: id });
    refreshSave();
  };

  return (
    <div className="h-full-safe flex flex-col items-center px-6 pt-12 pb-6 safe-t safe-b overflow-y-auto">
      <h2 className="font-display text-2xl font-bold text-white mb-6">🎨 Customize</h2>

      {SECTIONS.map((section) => (
        <div key={section.slot} className="w-full max-w-sm mb-6">
          <h3 className="font-display text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            {section.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {section.items.map((item) => {
              const isOwned = owned.includes(item.id);
              const isEquipped = equipped[section.slot] === item.id;
              return (
                <button
                  key={item.id}
                  className={`px-4 py-2 rounded-lg border text-sm font-body font-bold transition-colors ${
                    isEquipped
                      ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                      : isOwned
                      ? 'bg-bg-panel border-gray-600 text-white hover:border-neon-cyan/50'
                      : 'bg-bg-deep border-gray-700/30 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isOwned || isEquipped}
                  onClick={() => handleEquip(section.slot, item.id)}
                >
                  {isEquipped ? '✓ ' : isOwned ? '' : '🔒 '}
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <NeonButton onClick={() => setScreen('home')} variant="secondary" className="mt-4">
        ← Back
      </NeonButton>
    </div>
  );
}
