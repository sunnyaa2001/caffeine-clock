import type { DayKey, IntakeEntry } from '@/data/types';
import { dailySummary } from './summary';
import { dayKeyOf, hm } from './time';

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows: unknown[][]) => '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\n');

/** 연구용 일별 요약 CSV */
export function dailySummaryCsv(entries: IntakeEntry[], bedtimes: Record<DayKey, string>) {
  const days = [...new Set(entries.map((e) => dayKeyOf(e.intakeAt)))].sort();
  const head = ['day', 'dailyCaffeineMg', 'firstCaffeineTime', 'lastCaffeineTime', 'plannedBedtime', 'estimatedCaffeineAtBedtime', 'drinkCount', 'caffeineConsumedWithin6HoursOfBedtime'];
  const rows = days.map((d) => {
    const s = dailySummary(entries, d, bedtimes[d] ?? null);
    return [s.day, Math.round(s.dailyCaffeineMg * 10) / 10, s.firstCaffeineTime, s.lastCaffeineTime, s.plannedBedtime, s.estimatedCaffeineAtBedtime === null ? '' : Math.round(s.estimatedCaffeineAtBedtime * 10) / 10, s.drinkCount, s.caffeineConsumedWithin6HoursOfBedtime];
  });
  return toCsv([head, ...rows]);
}

export function entriesCsv(entries: IntakeEntry[]) {
  const head = ['day', 'intakeTime', 'intakeAt', 'cafe', 'drink', 'size', 'caffeineMg', 'drinkId'];
  const rows = [...entries]
    .sort((a, b) => a.intakeAt.localeCompare(b.intakeAt))
    .map((e) => [dayKeyOf(e.intakeAt), hm(e.intakeAt), e.intakeAt, e.drinkSnapshot.cafeName, e.drinkSnapshot.name, e.drinkSnapshot.size, e.drinkSnapshot.caffeineMg, e.drinkId]);
  return toCsv([head, ...rows]);
}

export function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
