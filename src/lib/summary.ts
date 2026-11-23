import { APP_CONFIG } from '@/config/app';
import type { DailySummary, DayKey, IntakeEntry } from '@/data/types';
import { estimateAt, toDoses } from './caffeine';
import { bedtimeAt, dayKeyOf, dayRange, HOUR, hm } from './time';

export const entriesForDay = (entries: IntakeEntry[], day: DayKey) =>
  entries
    .filter((e) => dayKeyOf(e.intakeAt) === day)
    .sort((a, b) => a.intakeAt.localeCompare(b.intakeAt));

/** 취침 시점 계산에 쓰는 기록: 취침 전 lookbackHours 이내 전부 (전날 늦은 음료 포함) */
export function entriesAffecting(entries: IntakeEntry[], until: number) {
  const from = until - APP_CONFIG.lookbackHours * HOUR;
  return entries.filter((e) => {
    const t = new Date(e.intakeAt).getTime();
    return t >= from && t <= until;
  });
}

/** 연구용 일일 지표. 저장하지 않고 항상 계산한다. */
export function dailySummary(entries: IntakeEntry[], day: DayKey, bedtime: string | null): DailySummary {
  const list = entriesForDay(entries, day);
  const total = list.reduce((s, e) => s + e.drinkSnapshot.caffeineMg, 0);
  let estimated: number | null = null;
  let within: boolean | null = null;
  if (bedtime) {
    const bt = bedtimeAt(day, bedtime).getTime();
    estimated = list.length ? estimateAt(toDoses(entriesAffecting(entries, bt)), bt).mid : 0;
    within = list.some((e) => {
      const diff = bt - new Date(e.intakeAt).getTime();
      return diff >= 0 && diff < APP_CONFIG.lateIntakeWindowHours * HOUR;
    });
  }
  return {
    day,
    dailyCaffeineMg: total,
    firstCaffeineTime: list.length ? hm(list[0].intakeAt) : null,
    lastCaffeineTime: list.length ? hm(list[list.length - 1].intakeAt) : null,
    plannedBedtime: bedtime,
    estimatedCaffeineAtBedtime: estimated,
    drinkCount: list.length,
    caffeineConsumedWithin6HoursOfBedtime: list.length ? within : null,
  };
}

export const isInDay = (iso: string, day: DayKey) => {
  const [s, e] = dayRange(day);
  const t = new Date(iso).getTime();
  return t >= s && t < e;
};
