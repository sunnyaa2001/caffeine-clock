'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ScreenTitle } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState, InlineNotice } from '@/components/ui/States';
import { CAFES, drinksForCafe } from '@/data/catalog';

/** 캠퍼스 선택 없이 바로 카페 목록을 보여준다. (카페 데이터의 campusIds는 나중을 위해 유지) */
export function CafeList() {
  const [q, setQ] = useState('');
  const cafes = useMemo(() => {
    const s = q.trim().replace(/\s/g, '').toLowerCase();
    return s ? CAFES.filter((c) => c.brandName.replace(/\s/g, '').toLowerCase().includes(s)) : CAFES;
  }, [q]);

  return (
    <div className="pt-5">
      <ScreenTitle title="어느 카페 음료인가요?" />
      <SearchField value={q} onChange={setQ} placeholder="카페를 검색하세요" />
      <div className="mt-3">
        <InlineNotice>메뉴와 카페인 수치는 각 브랜드가 공개한 자료 기준이에요. 매장마다 조금씩 다를 수 있어요.</InlineNotice>
      </div>
      {cafes.length === 0 ? (
        <EmptyState title="찾는 카페가 없어요." body="다른 이름으로 검색해보세요." />
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {cafes.map((c, i) => (
            <li key={c.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
              <Link href={`/explore/${c.id}/`} className="pressable block">
                <Card className="flex h-[104px] flex-col justify-between p-4">
                  <span className="text-[17px] leading-snug font-bold">{c.brandName}</span>
                  <span className="text-caption text-ink-3">음료 {drinksForCafe(c.id).length}</span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
