'use client';
import { useMemo } from 'react';
import type { AppData } from '@/data/repository';
import { bedtimeFor } from '@/data/store';
import { estimateAt, toDoses } from '@/lib/caffeine';
import { entriesAffecting, entriesForDay } from '@/lib/summary';
import { bedtimeAt, dayKeyOf, HOUR } from '@/lib/time';

/** 오늘 화면(홈, 분석)에서 쓰는 계산 결과를 한곳에서 만든다. */
export function useTodayModel(data: AppData | null, now: number) {
  return useMemo(() => {
    if (!data) return null;
    const day = dayKeyOf(now);
    const todays = entriesForDay(data.entries, day);
    const bed = bedtimeFor(data, day);
    const bedtimeMs = bedtimeAt(day, bed.time).getTime();
    const affecting = entriesAffecting(data.entries, Math.max(bedtimeMs, now));
    const doses = toDoses(affecting);
    const atBed = estimateAt(doses, bedtimeMs);
    const total = todays.reduce((s, e) => s + e.drinkSnapshot.caffeineMg, 0);
    const first = todays[0] ? new Date(todays[0].intakeAt).getTime() : now;
    const chartStart = Math.min(first, now) - 1 * HOUR;
    const chartEnd = Math.max(bedtimeMs, now) + 2 * HOUR;
    return {
      day,
      todays,
      bedtime: bed.time,
      bedtimeIsSet: bed.isSet,
      bedtimeMs,
      bedtimePassed: now > bedtimeMs,
      doses,
      atBed,
      nowRemaining: estimateAt(doses, now).mid,
      total,
      last: todays[todays.length - 1] ?? null,
      chartStart,
      chartEnd,
    };
  }, [data, now]);
}
