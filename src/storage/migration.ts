/**
 * Save-data migration.
 *
 * Each migration upgrades from `version -> version+1`.
 * `migrate` walks the chain from the stored version up to SAVE_VERSION,
 * re-validating at the end. Unknown / future versions reset safely.
 */
import type { SaveData } from '@/types';
import { SAVE_VERSION } from '@/game/config/constants';
import { validateSaveData } from './validate';
import { defaultSaveData } from './defaults';

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/** Ordered migrations: index i migrates version (i+1) -> (i+2). */
const MIGRATIONS: Migration[] = [
  // No migrations yet (v1 is current). Future v1->v2 goes here.
];

/**
 * Migrate raw parsed data to the current save version.
 * Returns a fully validated SaveData. Never throws.
 */
export function migrate(raw: unknown): SaveData {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return defaultSaveData();
  }
  let data = raw as Record<string, unknown>;
  let version = typeof data.version === 'number' ? data.version : 0;

  // Defensive cap to avoid runaway loops on corrupt versions.
  let guard = 0;
  while (version < SAVE_VERSION && guard < 50) {
    const migrator = MIGRATIONS[version - 1];
    if (!migrator) {
      // No migrator for this version; bail to defaults to stay safe.
      return defaultSaveData();
    }
    data = migrator(data);
    version += 1;
    guard += 1;
  }

  return validateSaveData({ ...data, version: SAVE_VERSION });
}
