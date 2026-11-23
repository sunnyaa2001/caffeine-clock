import { notFound } from 'next/navigation';
import { CAMPUSES, getCampus } from '@/data/catalog';
import type { CampusId } from '@/data/types';
import { CafeList } from '@/features/explore/CafeList';

export const dynamicParams = false;
export function generateStaticParams() {
  return CAMPUSES.map((c) => ({ campusId: c.id }));
}

export default async function Page({ params }: PageProps<'/explore/[campusId]'>) {
  const { campusId } = await params;
  if (!getCampus(campusId)) notFound();
  return <CafeList campusId={campusId as CampusId} />;
}
