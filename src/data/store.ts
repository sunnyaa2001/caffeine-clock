'use client';

import { useSyncExternalStore } from 'react';
import type { AppData } from './repository';
import { emptyData } from './repository';
import { localRepository } from './localRepository';
import type { CampusId, DayKey, IntakeEntry, Settings } from './types';
import { dayKeyOf } from '@/lib/time';
import { isRemoteMode } from '@/config/backend';
import { endSession, enqueue, flush, normalizeCode, RemoteError, rpc, setInvalidCodeHandler, startSession } from './remote';

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
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

/** 서버에 함께 저장하는 설정 (온보딩 여부 등 기기 전용 값은 제외) */
const syncedSettings = (s: Settings) => ({ defaultBedtime: s.defaultBedtime, weightKg: s.weightKg, notifications: s.notifications });

type ServerData = { settings: Partial<Settings> | null; entries: IntakeEntry[]; bedtimes: Record<DayKey, string> };
function applyServer(d: ServerData) {
  const s = ensure();
  const entries = d.entries.map((e) => ({ ...e, drinkSnapshot: { ...e.drinkSnapshot, caffeineMg: Number(e.drinkSnapshot.caffeineMg) } }));
  const settings = { ...s.settings, ...(d.settings ?? {}) };
  repo.saveEntries(entries);
  repo.saveBedtimes(d.bedtimes);
  repo.saveSettings(settings);
  set({ ...s, entries, bedtimes: d.bedtimes, settings });
}

export const actions = {
  updateSettings(patch: Partial<Settings>) {
    const s = ensure();
    const settings = { ...s.settings, ...patch };
    repo.saveSettings(settings);
    set({ ...s, settings });
    if ('weightKg' in patch || 'notifications' in patch || 'defaultBedtime' in patch) enqueue('cc_save_settings', { p_settings: syncedSettings(settings) });
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
    enqueue('cc_upsert_entry', { p_entry: entry });
    if (bedtimes !== s.bedtimes) enqueue('cc_set_bedtime', { p_day: day, p_bedtime: bedtimes[day] });
    return entry;
  },
  updateEntryTime(id: string, intakeAt: string) {
    const s = ensure();
    const entries = s.entries.map((e) => (e.id === id ? { ...e, intakeAt, updatedAt: new Date().toISOString() } : e));
    repo.saveEntries(entries);
    set({ ...s, entries });
    const changed = entries.find((e) => e.id === id);
    if (changed) enqueue('cc_upsert_entry', { p_entry: changed });
  },
  deleteEntry(id: string) {
    const s = ensure();
    const entries = s.entries.filter((e) => e.id !== id);
    repo.saveEntries(entries);
    set({ ...s, entries });
    enqueue('cc_delete_entry', { p_id: id });
  },
  setBedtime(day: DayKey, time: string) {
    const s = ensure();
    const bedtimes = { ...s.bedtimes, [day]: time };
    const settings = { ...s.settings, defaultBedtime: time };
    repo.saveBedtimes(bedtimes);
    repo.saveSettings(settings);
    set({ ...s, bedtimes, settings });
    queueBedtime(day, time, settings);
  },
  replaceAll(data: Pick<AppData, 'entries' | 'bedtimes'>) {
    const s = ensure();
    repo.saveEntries(data.entries);
    repo.saveBedtimes(data.bedtimes);
    set({ ...s, ...data });
  },
  /** 입장코드 확인 후 서버 기록을 불러온다. 실패하면 RemoteError를 던진다. */
  async login(raw: string) {
    const code = normalizeCode(raw);
    const ok = await rpc<boolean>('cc_login', { p_code: code });
    if (!ok) throw new RemoteError('invalid_code');
    const d = await rpc<ServerData>('cc_load', { p_code: code });
    startSession(code);
    applyServer(d);
  },
  /** 보낼 기록을 먼저 보낸 뒤 서버 기록으로 화면을 맞춘다. */
  async refresh(code: string) {
    const sent = await flush();
    if (!sent) return;
    try {
      applyServer(await rpc<ServerData>('cc_load', { p_code: code }));
    } catch {
      /* 오프라인: 기기에 있는 기록으로 계속 사용 */
    }
  },
  logout() {
    endSession();
    repo.clearAll();
    const fresh = emptyData();
    fresh.settings.onboardingDone = ensure().settings.onboardingDone;
    repo.saveSettings(fresh.settings);
    set(fresh);
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

// 취침시간 휠을 굴리는 동안 여러 번 바뀌므로, 멈춘 뒤 마지막 값만 서버로 보낸다.
let bedtimeTimer: ReturnType<typeof setTimeout> | null = null;
let bedtimeSend: (() => void) | null = null;
function queueBedtime(day: DayKey, time: string, settings: Settings) {
  if (!isRemoteMode()) return;
  if (bedtimeTimer) clearTimeout(bedtimeTimer);
  bedtimeSend = () => {
    bedtimeTimer = null;
    bedtimeSend = null;
    enqueue('cc_set_bedtime', { p_day: day, p_bedtime: time });
    enqueue('cc_save_settings', { p_settings: syncedSettings(settings) });
  };
  bedtimeTimer = setTimeout(bedtimeSend, 1200);
}

if (typeof window !== 'undefined') {
  setInvalidCodeHandler(() => actions.logout());
  // 앱을 닫거나 다른 앱으로 넘어갈 때 대기 중인 취침시간을 바로 보낸다.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && bedtimeSend) {
      if (bedtimeTimer) clearTimeout(bedtimeTimer);
      bedtimeSend();
    }
  });
}
