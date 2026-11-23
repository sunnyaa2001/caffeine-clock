import { notFound } from 'next/navigation';
import { CAFES, getCafe } from '@/data/catalog';
import { MenuBrowser } from '@/features/explore/MenuBrowser';

export const dynamicParams = false;
export function generateStaticParams() {
  return CAFES.map((c) => ({ cafeId: c.id }));
}

export default async function Page({ params }: PageProps<'/explore/[cafeId]'>) {
  const { cafeId } = await params;
  if (!getCafe(cafeId)) notFound();
  return <MenuBrowser cafeId={cafeId} />;
}
