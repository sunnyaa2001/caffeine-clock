import { notFound } from 'next/navigation';
import { CAMPUSES, cafesForCampus, drinksForCafe, getDrink } from '@/data/catalog';
import type { CampusId } from '@/data/types';
import { DrinkDetail } from '@/features/drink/DrinkDetail';

export const dynamicParams = false;
export function generateStaticParams() {
  return CAMPUSES.flatMap((c) =>
    cafesForCampus(c.id).flatMap((cafe) => drinksForCafe(cafe.id).map((d) => ({ campusId: c.id, cafeId: cafe.id, drinkId: d.id }))),
  );
}

export default async function Page({ params }: PageProps<'/explore/[campusId]/[cafeId]/[drinkId]'>) {
  const { campusId, cafeId, drinkId } = await params;
  if (!getDrink(drinkId)) notFound();
  return <DrinkDetail campusId={campusId as CampusId} cafeId={cafeId} drinkId={drinkId} />;
}
