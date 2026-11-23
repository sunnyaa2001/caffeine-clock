'use client';

import { useSyncExternalStore } from 'react';
import type { AppData } from './repository';
import { emptyData } from './repository';
import { localRepository } from './localRepository';
import type { CampusId, DayKey, IntakeEntry, Settings } from './types';
import { dayKeyOf } from '@/lib/time';

const repo = localRepository;

let state: AppData | null = null;
const listeners = new Set<() => void>();

function ensure(): AppData {
  if (!state) state = repo.load();
  return state;
}
function set(next: AppData) {
  state = next;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = () => {
    state = repo.load();
    listeners.forEach((x) => x());
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', onStorage);
  };
};

/** 서버 렌더 시에는 null → 화면은 로딩(스켈레톤)을 보여준다. */
export function useAppData(): AppData | null {
  return useSyncExternalStore(subscribe, ensure, () => null);
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const actions = {
  updateSettings(patch: Partial<Settings>) {
    const s = ensure();
    const settings = { ...s.settings, ...patch };
    repo.saveSettings(settings);
    set({ ...s, settings });
  },
  setLastCampus(id: CampusId) {
    actions.updateSettings({ lastCampusId: id });
  },
  addEntry(input: Pick<IntakeEntry, 'drinkId' | 'drinkSnapshot' | 'intakeAt'>): IntakeEntry {
    const s = ensure();
    const now = new Date().toISOString();
    const entry: IntakeEntry = { ...input, id: uid(), createdAt: now, updatedAt: now };
    const entries = [...s.entries, entry];
    repo.saveEntries(entries);
    // 연구 지표를 위해 그 날의 취침시간이 비어 있으면 현재 기본값으로 채워 둔다.
    const day = dayKeyOf(entry.intakeAt);
    let bedtimes = s.bedtimes;
    if (!bedtimes[day]) {
      bedtimes = { ...bedtimes, [day]: s.settings.defaultBedtime };
      repo.saveBedtimes(bedtimes);
    }
    set({ ...s, entries, bedtimes });
    return entry;
  },
  updateEntryTime(id: string, intakeAt: string) {
    const s = ensure();
    const entries = s.entries.map((e) => (e.id === id ? { ...e, intakeAt, updatedAt: new Date().toISOString() } : e));
    repo.saveEntries(entries);
    set({ ...s, entries });
  },
  deleteEntry(id: string) {
    const s = ensure();
    const entries = s.entries.filter((e) => e.id !== id);
    repo.saveEntries(entries);
    set({ ...s, entries });
  },
  setBedtime(day: DayKey, time: string) {
    const s = ensure();
    const bedtimes = { ...s.bedtimes, [day]: time };
    const settings = { ...s.settings, defaultBedtime: time };
    repo.saveBedtimes(bedtimes);
    repo.saveSettings(settings);
    set({ ...s, bedtimes, settings });
  },
  replaceAll(data: Pick<AppData, 'entries' | 'bedtimes'>) {
    const s = ensure();
    repo.saveEntries(data.entries);
    repo.saveBedtimes(data.bedtimes);
    set({ ...s, ...data });
  },
  resetAll() {
    repo.clearAll();
    const fresh = emptyData();
    fresh.settings.onboardingDone = true;
    repo.saveSettings(fresh.settings);
    set(fresh);
  },
};

/** 그 날의 취침시간: 저장된 값 → 없으면 최근 설정값(어제 값)을 기본으로 */
export function bedtimeFor(data: AppData, day: DayKey): { time: string; isSet: boolean } {
  const t = data.bedtimes[day];
  return t ? { time: t, isSet: true } : { time: data.settings.defaultBedtime, isSet: false };
}
