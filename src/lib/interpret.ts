// 예상 잔존량을 일상 언어로 풀어주는 참고 정보.
// "안전/위험" 판정이나 진단이 아니라, 공개된 기준과 실제 메뉴 비교로 감을 잡게 돕는다.
// 근거: EFSA(2015) 카페인 안전성 과학적 의견 — 취침 직전 약 100 mg(약 1.4 mg/kg)은
// 일부 성인에서 잠드는 시간을 늘리고 수면 시간을 줄일 수 있다.
// 50 mg 구간 경계는 이 앱의 설명용 구분이며 공식 기준이 아니다.
import { DRINKS, getBrand, servingText } from '@/data/catalog';

export type Meaning = {
  level: 0 | 1 | 2 | 3 | 4;
  headline: string;
  effects: string[];
  comparison: string | null;
};

export const DAILY_REFERENCE_MG = 400; // 식약처 성인 하루 최대 섭취 권고량

export function similarDrink(mg: number): string | null {
  if (mg < 20) return null;
  let best: (typeof DRINKS)[number] | null = null;
  for (const d of DRINKS) {
    if (d.sourceType !== 'official' || d.caffeineMg === null || d.caffeineMg < 20 || d.category === 'noncoffee' || d.category === 'decaf') continue;
    if (!best || Math.abs(d.caffeineMg - mg) < Math.abs(best.caffeineMg! - mg)) best = d;
  }
  if (!best) return null;
  const brand = getBrand(best.brandId)?.brandName ?? '';
  const size = best.size ? ` ${best.size}` : servingText(best) ? '' : '';
  return `${brand} ${best.name}${size} 1잔(${Math.round(best.caffeineMg!)} mg)`;
}

export function interpret(mg: number): Meaning {
  const comparison = similarDrink(mg);
  if (mg < 1) return { level: 0, headline: '카페인이 거의 남지 않을 것으로 예상돼요.', effects: [], comparison: null };
  if (mg < 50)
    return {
      level: 1,
      headline: '수면에 주는 영향이 크지 않은 편인 양이에요.',
      effects: ['카페인에 예민한 사람은 잠들기까지 시간이 조금 더 걸릴 수 있어요'],
      comparison,
    };
  if (mg < 100)
    return {
      level: 2,
      headline: '사람에 따라 잠드는 데 영향을 느낄 수 있는 양이에요.',
      effects: ['잠들기까지 시간이 조금 더 걸릴 수 있어요', '잠이 얕아질 수 있어요'],
      comparison,
    };
  const base = ['잠들기까지 시간이 더 걸릴 수 있어요', '자는 시간이 줄거나 중간에 깰 수 있어요', '깊은 잠이 줄어 아침에 덜 개운할 수 있어요'];
  if (mg < 200) return { level: 3, headline: '잠드는 시간과 수면의 질에 영향을 줄 수 있는 양이에요.', effects: base, comparison };
  return {
    level: 4,
    headline: '아직 각성 효과가 꽤 남아 있을 수 있는 양이에요.',
    effects: [...base, '예민한 사람은 가슴 두근거림이나 초조함을 느낄 수 있어요'],
    comparison,
  };
}
