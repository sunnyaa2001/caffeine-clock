import type { AppData, AppRepository } from './repository';
import { DEFAULT_SETTINGS, emptyData } from './repository';
import type { IntakeEntry } from './types';

export const STORAGE_KEYS = {
  settings: 'cc.v1.settings',
  entries: 'cc.v1.entries',
  bedtimes: 'cc.v1.bedtimes',
  meta: 'cc.meta',
} as const;

const SCHEMA_VERSION = 1;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null; // 막혀 있거나 깨진 값이면 기본값으로 시작
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 불가 환경(시크릿 모드 등): 세션 동안 메모리에서만 유지 */
  }
}

const isEntry = (e: unknown): e is IntakeEntry =>
  !!e && typeof e === 'object' && typeof (e as IntakeEntry).intakeAt === 'string' &&
  typeof (e as IntakeEntry).drinkSnapshot?.caffeineMg === 'number';

export const localRepository: AppRepository = {
  load(): AppData {
    if (typeof window === 'undefined') return emptyData();
    const meta = read<{ schemaVersion: number; firstUsedAt: string }>(STORAGE_KEYS.meta);
    if (!meta) write(STORAGE_KEYS.meta, { schemaVersion: SCHEMA_VERSION, firstUsedAt: new Date().toISOString() });
    const settings = read<Partial<AppData['settings']>>(STORAGE_KEYS.settings) ?? {};
    const entries = read<unknown[]>(STORAGE_KEYS.entries);
    const bedtimes = read<Record<string, string>>(STORAGE_KEYS.bedtimes);
    return {
      settings: {
        ...DEFAULT_SETTINGS,
        ...settings,
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(settings.notifications ?? {}) },
      },
      entries: Array.isArray(entries) ? entries.filter(isEntry) : [],
      bedtimes: bedtimes && typeof bedtimes === 'object' ? bedtimes : {},
    };
  },
  saveSettings: (s) => write(STORAGE_KEYS.settings, s),
  saveEntries: (e) => write(STORAGE_KEYS.entries, e),
  saveBedtimes: (b) => write(STORAGE_KEYS.bedtimes, b),
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* noop */
    }
  },
};
