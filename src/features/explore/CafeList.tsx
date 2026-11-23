'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BackBar, ScreenTitle } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState, InlineNotice } from '@/components/ui/States';
import { cafesForCampus, drinksForCafe, getCampus } from '@/data/catalog';
import type { CampusId } from '@/data/types';

export function CafeList({ campusId }: { campusId: CampusId }) {
  const campus = getCampus(campusId)!;
  const [q, setQ] = useState('');
  const cafes = useMemo(() => {
    const all = cafesForCampus(campusId);
    const s = q.trim().replace(/\s/g, '').toLowerCase();
    return s ? all.filter((c) => c.brandName.replace(/\s/g, '').toLowerCase().includes(s)) : all;
  }, [campusId, q]);
  const hasSample = cafesForCampus(campusId).some((c) => c.isSample);

  return (
    <>
      <BackBar
        fallback="/explore/"
        crumbs={[campus.name]}
        right={
          <Link href="/explore/" className="pressable inline-flex h-9 items-center rounded-full bg-fill px-3.5 text-caption font-semibold text-ink-2">
            캠퍼스 변경
          </Link>
        }
      />
      <ScreenTitle title={`${campus.name} 근처 카페`} />
      <SearchField value={q} onChange={setQ} placeholder="카페를 검색하세요" />
      {hasSample && (
        <div className="mt-3">
          <InlineNotice>예시 목록이에요. 캠퍼스별 실제 지점 정보는 준비 중이고, 메뉴와 카페인 수치는 브랜드 자료 기준이에요.</InlineNotice>
        </div>
      )}
      {cafes.length === 0 ? (
        <EmptyState title="찾는 카페가 없어요." body="다른 이름으로 검색해보세요." />
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {cafes.map((c, i) => {
            const n = drinksForCafe(c.id).length;
            return (
              <li key={c.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                <Link href={`/explore/${campusId}/${c.id}/`} className="pressable block">
                  <Card className="flex h-[112px] flex-col justify-between p-4">
                    <span className="text-[17px] leading-snug font-bold">{c.brandName}</span>
                    <span className="flex items-center justify-between text-caption text-ink-3">
                      <span>{c.branchName ?? (c.isSample ? '예시 지점' : '')}</span>
                      <span>음료 {n}</span>
                    </span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
