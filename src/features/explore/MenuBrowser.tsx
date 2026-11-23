'use client';
import { ArrowUpDown, Check } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { ChipGroup } from '@/components/ui/Chip';
import { cn } from '@/components/ui/cn';
import { BackBar, ScreenTitle } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState } from '@/components/ui/States';
import { CATEGORY_LABELS, drinksForCafe, getCafe, servingText } from '@/data/catalog';
import type { Drink, DrinkCategory } from '@/data/types';

type Sort = 'rank' | 'low' | 'high' | 'name';
const SORTS: { value: Sort; label: string }[] = [
  { value: 'rank', label: '추천순' },
  { value: 'low', label: '카페인 낮은 순' },
  { value: 'high', label: '카페인 높은 순' },
  { value: 'name', label: '이름순' },
];
const CATS: { value: 'all' | DrinkCategory; label: string }[] = [
  { value: 'all', label: '전체' },
  ...(Object.keys(CATEGORY_LABELS) as DrinkCategory[]).map((k) => ({ value: k, label: CATEGORY_LABELS[k] })),
];

const norm = (s: string) => s.replace(/[\s\-·()+]/g, '').toLowerCase();

function sortDrinks(list: Drink[], sort: Sort) {
  const arr = [...list];
  // 카페인 미확인 메뉴는 정렬과 관계없이 맨 뒤
  const val = (d: Drink, dir: 1 | -1) => (d.caffeineMg === null ? Infinity : d.caffeineMg * dir);
  if (sort === 'rank') arr.sort((a, b) => a.rank - b.rank);
  if (sort === 'low') arr.sort((a, b) => val(a, 1) - val(b, 1));
  if (sort === 'high') arr.sort((a, b) => val(a, -1) - val(b, -1));
  if (sort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  return arr;
}

export function MenuBrowser({ cafeId }: { cafeId: string }) {
  const cafe = getCafe(cafeId)!;
  const all = drinksForCafe(cafeId);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'all' | DrinkCategory>('all');
  const [sort, setSort] = useState<Sort>('rank');
  const [sortOpen, setSortOpen] = useState(false);
  const maxMg = Math.max(1, ...all.map((d) => d.caffeineMg ?? 0));

  const list = useMemo(() => {
    const s = norm(q);
    const filtered = all.filter((d) => (cat === 'all' || d.category === cat) && (!s || norm(d.name).includes(s)));
    return sortDrinks(filtered, sort);
  }, [all, q, cat, sort]);
  const catOptions = CATS.filter((c) => c.value === 'all' || all.some((d) => d.category === c.value));

  return (
    <>
      <BackBar fallback="/explore/" crumbs={['카페', cafe.brandName]} />
      <ScreenTitle title={cafe.brandName} />
      <SearchField value={q} onChange={setQ} placeholder="음료를 검색하세요" />
      <div className="mt-3">
        <ChipGroup label="카테고리" options={catOptions} value={cat} onChange={setCat} />
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-sub text-ink-3">음료 {list.length}개</span>
        <button onClick={() => setSortOpen(true)} className="pressable -mr-2 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sub font-semibold text-ink-2">
          <ArrowUpDown size={16} />
          {SORTS.find((s) => s.value === sort)!.label}
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState title="찾는 음료가 없어요." body="다른 이름이나 카테고리로 찾아보세요." />
      ) : (
        <ul className="mt-2 space-y-2.5">
          {list.map((d, i) => (
            <li key={d.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}>
              <DrinkCard drink={d} max={maxMg} href={`/explore/${cafeId}/${d.id}/`} />
            </li>
          ))}
        </ul>
      )}

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="정렬">
        <ul className="pb-2">
          {SORTS.map((s) => (
            <li key={s.value}>
              <button
                onClick={() => {
                  setSort(s.value);
                  setSortOpen(false);
                }}
                className="pressable flex h-14 w-full items-center justify-between text-left text-body font-semibold"
                aria-pressed={sort === s.value}
              >
                <span className={sort === s.value ? 'text-accent' : ''}>{s.label}</span>
                {sort === s.value && <Check size={20} className="text-accent" strokeWidth={2.6} />}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}

function DrinkCard({ drink, max, href }: { drink: Drink; max: number; href: string }) {
  const mg = drink.caffeineMg;
  return (
    <Link href={href} className="pressable block">
      <Card className="flex items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[17px] leading-snug font-semibold">{drink.name}</p>
          <p className="mt-1 text-caption text-ink-3">
            {servingText(drink) || '용량 정보 없음'}
            {drink.sourceType === 'reference' && <span className="ml-1.5 rounded-md bg-fill px-1.5 py-0.5 font-semibold text-ink-2">참고 수치</span>}
          </p>
          {mg !== null && (
            <div className="mt-2.5 h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-fill" aria-hidden>
              <div className="h-full rounded-full bg-accent/80" style={{ width: `${Math.max(3, (mg / max) * 100)}%` }} />
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          {mg === null ? (
            <p className="text-caption font-medium text-ink-3">카페인 정보<br />미확인</p>
          ) : (
            <>
              <p className={cn('num text-[24px] leading-none font-bold')}>{Math.round(mg)}</p>
              <p className="mt-1 text-caption text-ink-3">mg</p>
            </>
          )}
        </div>
      </Card>
    </Link>
  );
}
