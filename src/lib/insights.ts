import { APP_CONFIG } from '@/config/app';
import type { DailySummary } from '@/data/types';
import { minutesFromDayStart, parseHM } from './time';

export type PeriodStats = {
  recordedDays: number;
  avgDailyMg: number | null;
  /** 하루 시작 기준 분 (자정 넘김 비교 가능) */
  avgLastIntakeMin: number | null;
  lateDays: number;
  daysWithBedtime: number;
};

const lastMin = (s: DailySummary) => {
  if (!s.lastCaffeineTime) return null;
  const m = parseHM(s.lastCaffeineTime);
  const d = new Date(2000, 0, 1, Math.floor(m / 60), m % 60);
  return minutesFromDayStart(d);
};

export function periodStats(days: DailySummary[]): PeriodStats {
  const rec = days.filter((d) => d.drinkCount > 0);
  const lasts = rec.map(lastMin).filter((x): x is number => x !== null);
  const withBed = rec.filter((d) => d.caffeineConsumedWithin6HoursOfBedtime !== null);
  return {
    recordedDays: rec.length,
    avgDailyMg: rec.length ? rec.reduce((s, d) => s + d.dailyCaffeineMg, 0) / rec.length : null,
    avgLastIntakeMin: lasts.length ? lasts.reduce((a, b) => a + b, 0) / lasts.length : null,
    lateDays: withBed.filter((d) => d.caffeineConsumedWithin6HoursOfBedtime).length,
    daysWithBedtime: withBed.length,
  };
}

/**
 * 차분하게 자기 패턴을 알려주는 문구만 만든다. 의료 조언·판단 표현은 쓰지 않는다.
 * @param last14 오래된 날 → 최근 날 순서의 14일 요약
 */
export function buildInsights(last14: DailySummary[]): string[] {
  const thisWeek = periodStats(last14.slice(-7));
  const prevWeek = periodStats(last14.slice(0, -7));
  const min = APP_CONFIG.insightMinDays;
  const out: string[] = [];
  if (thisWeek.recordedDays < min) return out;

  if (thisWeek.daysWithBedtime > 0) {
    out.push(
      thisWeek.lateDays > 0
        ? `최근 7일 중 ${thisWeek.lateDays}일은\n취침 ${APP_CONFIG.lateIntakeWindowHours}시간 이내에 카페인을 마셨어요.`
        : `최근 7일 동안은\n취침 ${APP_CONFIG.lateIntakeWindowHours}시간 이내에 마신 카페인이 없었어요.`,
    );
  }
  if (prevWeek.recordedDays >= min && thisWeek.avgLastIntakeMin !== null && prevWeek.avgLastIntakeMin !== null) {
    const diff = Math.round(thisWeek.avgLastIntakeMin - prevWeek.avgLastIntakeMin);
    if (Math.abs(diff) >= 10) {
      out.push(`지난주보다 마지막 카페인 시간이\n평균 ${Math.abs(diff)}분 ${diff < 0 ? '빨라졌어요' : '늦어졌어요'}.`);
    } else {
      out.push('마지막 카페인 시간이\n지난주와 비슷해요.');
    }
  }
  if (prevWeek.recordedDays >= min && thisWeek.avgDailyMg !== null && prevWeek.avgDailyMg) {
    const pct = Math.round(((thisWeek.avgDailyMg - prevWeek.avgDailyMg) / prevWeek.avgDailyMg) * 100);
    if (Math.abs(pct) >= 5) {
      out.push(`이번 주 평균 카페인 섭취량은\n지난주보다 ${Math.abs(pct)}% ${pct < 0 ? '줄었어요' : '늘었어요'}.`);
    } else {
      out.push('이번 주 평균 카페인 섭취량은\n지난주와 비슷해요.');
    }
  }
  return out;
}
