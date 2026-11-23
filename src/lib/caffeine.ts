import { APP_CONFIG } from '@/config/app';
import type { IntakeEntry } from '@/data/types';
import { HOUR, MINUTE } from './time';

export type Dose = { mg: number; at: number };

export const toDoses = (entries: IntakeEntry[]): Dose[] =>
  entries.map((e) => ({ mg: e.drinkSnapshot.caffeineMg, at: new Date(e.intakeAt).getTime() }));

/** 음료 하나의 잔존량: dose × 0.5^((t - t_i)/H), 섭취 전에는 0 */
export function remainingOne(dose: Dose, t: number, halfLifeHours: number): number {
  if (t < dose.at) return 0;
  return dose.mg * Math.pow(0.5, (t - dose.at) / (halfLifeHours * HOUR));
}

/** 전체 잔존량 = 각 음료 잔존량의 합 */
export function totalRemaining(doses: Dose[], t: number, halfLifeHours: number = APP_CONFIG.halfLifeHours): number {
  return doses.reduce((sum, d) => sum + remainingOne(d, t, halfLifeHours), 0);
}

export type Estimate = { mid: number; low: number; high: number };

/** 중앙값(5h)과 예상범위(4h~6h). 반감기가 길수록 많이 남으므로 high = 6h. */
export function estimateAt(doses: Dose[], t: number): Estimate {
  const { fast, slow } = APP_CONFIG.halfLifeRange;
  return {
    mid: totalRemaining(doses, t, APP_CONFIG.halfLifeHours),
    low: totalRemaining(doses, t, fast),
    high: totalRemaining(doses, t, slow),
  };
}

export type CurvePoint = { t: number; mid: number; range: [number, number] };

export function decayCurve(doses: Dose[], start: number, end: number, stepMin = 5): CurvePoint[] {
  const pts: CurvePoint[] = [];
  const step = stepMin * MINUTE;
  const s = Math.floor(start / step) * step;
  for (let t = s; t <= end + step / 2; t += step) {
    const e = estimateAt(doses, t);
    pts.push({ t, mid: e.mid, range: [e.low, e.high] });
  }
  // 섭취 순간의 계단을 정확히 표현하기 위해 섭취 시각 직전/직후 점을 넣는다.
  for (const d of doses) {
    if (d.at <= s || d.at >= end) continue;
    const before = estimateAt(doses, d.at - 1);
    const at = estimateAt(doses, d.at);
    pts.push({ t: d.at - 1, mid: before.mid, range: [before.low, before.high] });
    pts.push({ t: d.at, mid: at.mid, range: [at.low, at.high] });
  }
  pts.sort((a, b) => a.t - b.t);
  return pts.filter((p, i) => i === 0 || p.t !== pts[i - 1].t);
}

/** 화면 표기: 정수 반올림, 1 mg 미만은 따로 */
export function formatMg(mg: number): string {
  if (mg > 0 && mg < 1) return '1 mg 미만';
  return `${Math.round(mg)} mg`;
}
export const roundMg = (mg: number) => Math.round(mg);

/** 체중을 입력한 경우에만 보조 정보로 사용 */
export const mgPerKg = (mg: number, weightKg: number) => Math.round((mg / weightKg) * 10) / 10;
