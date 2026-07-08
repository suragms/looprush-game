import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { NeonButton } from '@/components/NeonButton';
import { ACHIEVEMENTS } from '@/game/config/achievements';

export function AchievementsScreen() {
  const save = useSettingsStore((s) => s.save);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="h-full-safe flex flex-col items-center px-6 pt-12 pb-6 safe-t safe-b overflow-y-auto">
      <h2 className="font-display text-2xl font-bold text-white mb-6">🏆 Achievements</h2>

      <div className="w-full max-w-sm space-y-2">
        {ACHIEVEMENTS.map((ach) => {
          const record = save.achievements[ach.id];
          const unlocked = record?.unlocked ?? false;
          return (
            <div
              key={ach.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                unlocked
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-bg-panel border-gray-700/40 opacity-60'
              }`}
            >
              <span className="text-2xl">{unlocked ? '🏆' : '🔒'}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-display text-sm font-bold ${
                    unlocked ? 'text-neon-yellow' : 'text-gray-400'
                  }`}
                >
                  {ach.name}
                </p>
                <p className="text-xs text-gray-500">{ach.description}</p>
              </div>
              {unlocked && record && (
                <span className="text-xs text-gray-600">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-gray-600 text-xs mt-4 font-body">
        {Object.values(save.achievements).filter((a) => a.unlocked).length} / {ACHIEVEMENTS.length} unlocked
      </p>

      <NeonButton onClick={() => setScreen('home')} variant="secondary" className="mt-4">
        ← Back
      </NeonButton>
    </div>
  );
}
