import { APP_CONFIG } from '@/config/app';
import type { DayKey } from '@/data/types';

const pad = (n: number) => String(n).padStart(2, '0');
export const HOUR = 3_600_000;
export const MINUTE = 60_000;

/** 로컬 날짜 'YYYY-MM-DD' */
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'HH:mm' */
export const hm = (d: Date | number | string) => {
  const x = new Date(d);
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`;
};

/** 하루 기준(dayStartHour)을 적용한 날짜 키 */
export function dayKeyOf(d: Date | number | string): DayKey {
  const x = new Date(new Date(d).getTime() - APP_CONFIG.dayStartHour * HOUR);
  return ymd(x);
}

export const todayKey = (now = new Date()) => dayKeyOf(now);

/** DayKey의 자정(로컬) */
export function dayKeyToDate(day: DayKey): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: DayKey, n: number): DayKey {
  const d = dayKeyToDate(day);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

/** 해당 하루의 시작/끝 시각 (dayStartHour ~ 다음날 dayStartHour) */
export function dayRange(day: DayKey): [number, number] {
  const start = dayKeyToDate(day);
  start.setHours(APP_CONFIG.dayStartHour, 0, 0, 0);
  return [start.getTime(), start.getTime() + 24 * HOUR];
}

/** 'HH:mm' → 분 */
export const parseHM = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
export const formatMinutes = (mins: number) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};

/** 그 날의 취침 예정 시각. 정오 이전 시간(예: 00:30)은 다음 날로 해석한다. */
export function bedtimeAt(day: DayKey, time: string): Date {
  const mins = parseHM(time);
  const d = dayKeyToDate(day);
  if (mins < APP_CONFIG.bedtimeNextDayBeforeHour * 60) d.setDate(d.getDate() + 1);
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
}

/** 하루 시작 시각 기준으로 몇 분이 지났는지 (자정을 넘는 시각 비교용) */
export function minutesFromDayStart(d: Date | number | string): number {
  const x = new Date(d);
  const mins = x.getHours() * 60 + x.getMinutes();
  return (mins - APP_CONFIG.dayStartHour * 60 + 1440) % 1440;
}
export const dayStartMinutesToHM = (m: number) => formatMinutes(m + APP_CONFIG.dayStartHour * 60);

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
export function shortDayLabel(day: DayKey): string {
  const d = dayKeyToDate(day);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
export function weekdayLabel(day: DayKey): string {
  return WEEK[dayKeyToDate(day).getDay()];
}

/** '방금', '25분 전' 등 상대 시간이 아닌, 시각 그대로 보여주는 것을 기본으로 한다. */
export function durationText(ms: number): string {
  const totalMin = Math.round(Math.abs(ms) / MINUTE);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}
