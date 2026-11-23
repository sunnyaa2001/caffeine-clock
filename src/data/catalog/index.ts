import type { CampusId, Drink, DrinkCategory } from '../types';
import { CAFES } from './cafes.sample';
import { BRANDS, DRINKS } from './drinks.generated';

export { CAMPUSES, getCampus } from './campuses';
export { CAFES, BRANDS, DRINKS };

export const CATEGORY_LABELS: Record<DrinkCategory, string> = {
  coffee: '커피',
  coldbrew: '콜드브루',
  latte: '라떼',
  noncoffee: '논커피',
  decaf: '디카페인',
};

export const cafesForCampus = (campusId: CampusId) => CAFES.filter((c) => c.campusIds.includes(campusId));
export const getCafe = (id: string) => CAFES.find((c) => c.id === id) ?? null;
export const getBrand = (brandId: string) => BRANDS.find((b) => b.brandId === brandId) ?? null;
export const drinksForCafe = (cafeId: string): Drink[] => {
  const cafe = getCafe(cafeId);
  return cafe ? DRINKS.filter((d) => d.brandId === cafe.brandId) : [];
};
export const getDrink = (id: string) => DRINKS.find((d) => d.id === id) ?? null;

/** 화면용 용량 표기: 'Tall · 355 mL', '330 g', 'L · 520 mL' */
export function servingText(d: Drink): string {
  const parts: string[] = [];
  if (d.size) parts.push(d.size);
  if (d.servingLabel) {
    if (d.servingLabel.endsWith('oz') && d.volumeMl) parts.push(`${d.servingLabel} (약 ${d.volumeMl} mL)`);
    else parts.push(d.servingLabel);
  }
  if (d.temperature === 'hot') parts.unshift('HOT');
  return parts.join(' · ');
}
