import { notFound } from 'next/navigation';
import { CAFES, drinksForCafe, getDrink } from '@/data/catalog';
import { DrinkDetail } from '@/features/drink/DrinkDetail';

export const dynamicParams = false;
export function generateStaticParams() {
  return CAFES.flatMap((c) => drinksForCafe(c.id).map((d) => ({ cafeId: c.id, drinkId: d.id })));
}

export default async function Page({ params }: PageProps<'/explore/[cafeId]/[drinkId]'>) {
  const { cafeId, drinkId } = await params;
  if (!getDrink(drinkId)) notFound();
  return <DrinkDetail cafeId={cafeId} drinkId={drinkId} />;
}
