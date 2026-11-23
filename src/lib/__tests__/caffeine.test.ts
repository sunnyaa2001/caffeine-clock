import { describe, expect, it } from 'vitest';
import { estimateAt, totalRemaining, decayCurve, formatMg, mgPerKg } from '../caffeine';
import { bedtimeAt, dayKeyOf, minutesFromDayStart } from '../time';
import { dailySummary } from '../summary';
import { buildInsights } from '../insights';
import type { IntakeEntry, DailySummary } from '@/data/types';

const H = 3_600_000;
const entry = (mg: number, iso: string): IntakeEntry => ({
  id: iso, drinkId: null, drinkSnapshot: { name: 'x', cafeName: 'y', size: null, caffeineMg: mg },
  intakeAt: iso, createdAt: iso, updatedAt: iso,
});

describe('잔존량 계산', () => {
  it('반감기마다 절반', () => {
    const d = [{ mg: 200, at: 0 }];
    expect(totalRemaining(d, 5 * H, 5)).toBeCloseTo(100);
    expect(totalRemaining(d, 10 * H, 5)).toBeCloseTo(50);
  });
  it('섭취 전에는 0', () => {
    expect(totalRemaining([{ mg: 200, at: 10 * H }], 5 * H, 5)).toBe(0);
  });
  it('여러 음료는 각각 계산 후 합산', () => {
    const d = [{ mg: 100, at: 0 }, { mg: 100, at: 5 * H }];
    expect(totalRemaining(d, 5 * H, 5)).toBeCloseTo(150);
  });
  it('대표 시나리오: 180 mg 16:20 → 00:30 = 약 58 mg (44–70)', () => {
    const at = new Date(2026, 10, 23, 16, 20).getTime();
    const bt = bedtimeAt('2026-11-23', '00:30').getTime();
    expect((bt - at) / H).toBeCloseTo(8 + 10 / 60);
    const e = estimateAt([{ mg: 180, at }], bt);
    expect(Math.round(e.mid)).toBe(58);
    expect(Math.round(e.low)).toBe(44);
    expect(Math.round(e.high)).toBe(70);
  });
  it('곡선은 시간순이고 범위가 중앙값을 감싼다', () => {
    const pts = decayCurve([{ mg: 150, at: 2 * H }], 0, 12 * H);
    for (let i = 1; i < pts.length; i++) expect(pts[i].t).toBeGreaterThan(pts[i - 1].t);
    for (const p of pts) {
      expect(p.range[0]).toBeLessThanOrEqual(p.mid + 1e-9);
      expect(p.range[1]).toBeGreaterThanOrEqual(p.mid - 1e-9);
    }
  });
  it('표기', () => {
    expect(formatMg(0.4)).toBe('1 mg 미만');
    expect(formatMg(67.6)).toBe('68 mg');
    expect(mgPerKg(150, 60)).toBe(2.5);
  });
});

describe('날짜 기준', () => {
  it('새벽 1시는 전날, 오전 5시는 당일', () => {
    expect(dayKeyOf(new Date(2026, 10, 24, 1, 0))).toBe('2026-11-23');
    expect(dayKeyOf(new Date(2026, 10, 24, 5, 0))).toBe('2026-11-24');
  });
  it('취침 00:30은 다음 날, 23:00은 당일', () => {
    expect(bedtimeAt('2026-11-23', '00:30').getDate()).toBe(24);
    expect(bedtimeAt('2026-11-23', '23:00').getDate()).toBe(23);
  });
  it('하루 시작 기준 분', () => {
    expect(minutesFromDayStart(new Date(2026, 0, 1, 4, 0))).toBe(0);
    expect(minutesFromDayStart(new Date(2026, 0, 1, 1, 0))).toBe(21 * 60);
  });
});

describe('일일 요약', () => {
  it('연구 지표 계산', () => {
    const list = [entry(150, new Date(2026, 10, 23, 9, 10).toISOString()), entry(180, new Date(2026, 10, 23, 19, 0).toISOString())];
    const s = dailySummary(list, '2026-11-23', '00:30');
    expect(s.dailyCaffeineMg).toBe(330);
    expect(s.drinkCount).toBe(2);
    expect(s.firstCaffeineTime).toBe('09:10');
    expect(s.lastCaffeineTime).toBe('19:00');
    expect(s.caffeineConsumedWithin6HoursOfBedtime).toBe(true);
    expect(s.estimatedCaffeineAtBedtime).toBeGreaterThan(0);
  });
});

describe('인사이트', () => {
  const day = (i: number, mg: number, last: string, late: boolean): DailySummary => ({
    day: `d${i}`, dailyCaffeineMg: mg, firstCaffeineTime: '09:00', lastCaffeineTime: last, plannedBedtime: '00:30',
    estimatedCaffeineAtBedtime: 10, drinkCount: 1, caffeineConsumedWithin6HoursOfBedtime: late,
  });
  it('3일 미만이면 없음', () => {
    expect(buildInsights([day(1, 100, '15:00', false)])).toEqual([]);
  });
  it('지난주 대비 비교', () => {
    const prev = Array.from({ length: 7 }, (_, i) => day(i, 200, '18:00', true));
    const cur = Array.from({ length: 7 }, (_, i) => day(i + 7, 176, '17:12', i < 4));
    const out = buildInsights([...prev, ...cur]);
    expect(out[0]).toContain('7일 중 4일');
    expect(out[1]).toContain('48분 빨라졌어요');
    expect(out[2]).toContain('12% 줄었어요');
  });
});

import { interpret, similarDrink } from '../interpret';
describe('잔존량 해석', () => {
  it('구간', () => {
    expect(interpret(0.5).level).toBe(0);
    expect(interpret(30).level).toBe(1);
    expect(interpret(58).level).toBe(2);
    expect(interpret(120).level).toBe(3);
    expect(interpret(250).level).toBe(4);
  });
  it('비슷한 실제 메뉴', () => {
    expect(similarDrink(75)).toContain('75 mg');
    expect(similarDrink(10)).toBeNull();
  });
});
