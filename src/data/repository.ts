import type { DayKey, IntakeEntry, Settings } from './types';
import { APP_CONFIG } from '@/config/app';

/**
 * 화면은 이 인터페이스만 사용한다.
 * 현재는 localStorage 구현(localRepository)이고, 나중에 Supabase 구현으로 교체할 수 있다.
 */
export interface AppRepository {
  load(): AppData;
  saveSettings(settings: Settings): void;
  saveEntries(entries: IntakeEntry[]): void;
  saveBedtimes(bedtimes: Record<DayKey, string>): void;
  clearAll(): void;
}

export type AppData = {
  settings: Settings;
  entries: IntakeEntry[];
  bedtimes: Record<DayKey, string>;
};

export const DEFAULT_SETTINGS: Settings = {
  onboardingDone: false,
  defaultBedtime: APP_CONFIG.defaultBedtime,
  lastCampusId: null,
  weightKg: null,
  notifications: { dailyReminder: false, bedtimeReminder: false },
};

export const emptyData = (): AppData => ({ settings: { ...DEFAULT_SETTINGS }, entries: [], bedtimes: {} });
