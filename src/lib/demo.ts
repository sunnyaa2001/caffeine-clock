// 발표·테스트용 예시 기록. 음료와 카페인 값은 실제 메뉴 데이터에서 가져오고,
// 마신 시각과 취침시간만 예시로 만든다.
import { DRINKS, getBrand, servingText } from '@/data/catalog';
import type { DayKey, IntakeEntry } from '@/data/types';
import { addDays, dayKeyToDate, todayKey } from './time';

const PICKS = ['starbucks-01', 'megacoffee-03', 'compose-01', 'paikdabang-05', 'ediya-01', 'twosome-02', 'gongcha-01', 'starbucks-07', 'hasamdong-02', 'megacoffee-01'];

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function buildDemo(days = 13): { entries: IntakeEntry[]; bedtimes: Record<DayKey, string> } {
  const r = rng(20261123);
  const today = todayKey();
  const entries: IntakeEntry[] = [];
  const bedtimes: Record<DayKey, string> = {};
  const nowMs = Date.now();
  for (let i = days; i >= 0; i--) {
    const day = addDays(today, -i);
    // 지난주에는 저녁 늦게, 이번 주에는 조금 더 일찍 마시는 예시 패턴
    const lastStart = i > 6 ? 19 : 16.5;
    const count = 1 + Math.floor(r() * 3);
    const times = i === 0 ? [9 + r() * 2, 12 + r() * 1.5] : [9 + r() * 2, 12.5 + r() * 2, lastStart + r() * 3].slice(-count);
    times.forEach((h, k) => {
      const pick = PICKS[Math.floor(r() * PICKS.length)];
      const d = DRINKS.find((x) => x.id === pick && x.caffeineMg !== null)!;
      const at = dayKeyToDate(day);
      at.setHours(Math.floor(h), Math.floor((h % 1) * 60), 0, 0);
      if (at.getTime() > nowMs) return; // 오늘은 이미 지난 시각만
      const iso = at.toISOString();
      entries.push({
        id: `demo-${day}-${k}`,
        drinkId: d.id,
        drinkSnapshot: { name: d.name, cafeName: getBrand(d.brandId)?.brandName ?? '', size: servingText(d) || null, caffeineMg: d.caffeineMg! },
        intakeAt: iso,
        createdAt: iso,
        updatedAt: iso,
      });
    });
    bedtimes[day] = ['23:30', '00:00', '00:30', '01:00', '01:30'][Math.floor(r() * 5)];
  }
  return { entries, bedtimes };
}
