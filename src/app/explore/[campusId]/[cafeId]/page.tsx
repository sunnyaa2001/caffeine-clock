import { notFound } from 'next/navigation';
import { CAMPUSES, cafesForCampus, getCafe } from '@/data/catalog';
import type { CampusId } from '@/data/types';
import { MenuBrowser } from '@/features/explore/MenuBrowser';

export const dynamicParams = false;
export function generateStaticParams() {
  return CAMPUSES.flatMap((c) => cafesForCampus(c.id).map((cafe) => ({ campusId: c.id, cafeId: cafe.id })));
}

export default async function Page({ params }: PageProps<'/explore/[campusId]/[cafeId]'>) {
  const { campusId, cafeId } = await params;
  if (!getCafe(cafeId)) notFound();
  return <MenuBrowser campusId={campusId as CampusId} cafeId={cafeId} />;
}
