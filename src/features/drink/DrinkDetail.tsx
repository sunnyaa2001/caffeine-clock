'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackBar } from '@/components/ui/PageHeader';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { useToast } from '@/components/ui/Toast';
import { getBrand, getCafe, getDrink, servingText } from '@/data/catalog';
import { actions, bedtimeFor, useAppData } from '@/data/store';
import { estimateAt, mgPerKg, toDoses } from '@/lib/caffeine';
import { entriesAffecting } from '@/lib/summary';
import { bedtimeAt, dayKeyOf } from '@/lib/time';
import { IntakeTimeSheet } from '@/features/shared/IntakeTimeSheet';
import { useNow } from '@/hooks/useNow';

const BASIS: Record<string, string> = {
  official: '브랜드 공식 영양정보 기준',
  reference: '공개 후기에 인용된 참고 수치예요',
  unverified: '카페인 정보가 확인되지 않은 메뉴예요.',
};

export function DrinkDetail({ cafeId, drinkId }: { cafeId: string; drinkId: string }) {
  const drink = getDrink(drinkId)!;
  const cafe = getCafe(cafeId)!;
  const brand = getBrand(drink.brandId);
  const data = useAppData();
  const now = useNow();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const mg = drink.caffeineMg;

  // 지금 마신다면 오늘 취침 예정 시각에 얼마나 남을지 (기존 기록 포함)
  let preview: { bedtime: string; mg: number } | null = null;
  if (data && mg !== null) {
    const day = dayKeyOf(now);
    const bt = bedtimeFor(data, day).time;
    const btMs = bedtimeAt(day, bt).getTime();
    if (btMs > now) {
      const doses = [...toDoses(entriesAffecting(data.entries, btMs)), { mg, at: now }];
      preview = { bedtime: bt, mg: estimateAt(doses, btMs).mid };
    }
  }

  const record = (at: Date) => {
    if (mg === null) return;
    actions.addEntry({
      drinkId: drink.id,
      drinkSnapshot: { name: drink.name, cafeName: cafe.brandName, size: servingText(drink) || null, caffeineMg: mg },
      intakeAt: at.toISOString(),
    });
    setOpen(false);
    toast('오늘 기록에 추가했어요');
    setTimeout(() => router.push('/'), 350);
  };

  return (
    <>
      <BackBar fallback={`/explore/${cafeId}/`} crumbs={['카페', cafe.brandName]} />
      <section className="pt-3 pb-8">
        <p className="text-sub font-semibold text-ink-3">{cafe.brandName}</p>
        <h1 className="mt-1 text-title font-bold">{drink.name}</h1>
        <p className="num mt-2 text-body text-ink-2">{servingText(drink) || '용량 정보 없음'}</p>
      </section>

      <Card className="px-6 py-7">
        {mg === null ? (
          <>
            <p className="text-[22px] font-bold text-ink-2">카페인 정보 미확인</p>
            <p className="mt-2 text-sub text-ink-2">{BASIS.unverified} 확인되면 바로 반영할게요.</p>
          </>
        ) : (
          <>
            <p className="flex items-baseline gap-1.5">
              <span className="num text-display font-bold">{Math.round(mg)}</span>
              <span className="text-[22px] font-bold text-ink-2">mg</span>
            </p>
            <p className="mt-1 text-body font-semibold text-ink-2">카페인</p>
            <p className="mt-4 text-caption text-ink-3">{BASIS[drink.sourceType]}</p>
            {data?.settings.weightKg ? (
              <p className="mt-4 rounded-2xl bg-fill px-4 py-3 text-sub text-ink-2">
                이번 섭취량은 약 <b className="num text-ink">{mgPerKg(mg, data.settings.weightKg)} mg/kg</b>이에요.
              </p>
            ) : null}
          </>
        )}
      </Card>

      {preview && (
        <Card className="mt-3 px-6 py-5">
          <p className="text-sub text-ink-2">
            지금 마신다면 <b className="num text-ink">{preview.bedtime}</b>에
          </p>
          <p className="mt-1 text-body">
            카페인이 <b className="num text-accent">약 {Math.round(preview.mg)} mg</b> 남아 있을 것으로 예상돼요.
          </p>
          <p className="mt-2 text-caption text-ink-3">오늘 기록과 일반적인 반감기 5시간 기준</p>
        </Card>
      )}

      <Card className="mt-3 px-6 py-3">
        <Accordion title="정보 출처">
          <dl className="space-y-2 pb-2">
            <Row k="출처" v={drink.sourceType === 'unverified' ? '공식 메뉴명만 확인' : drink.sourceName} />
            {drink.sourceCheckedDate && <Row k="확인일" v={drink.sourceCheckedDate.replaceAll('-', '.')} />}
            {drink.note && <Row k="메모" v={drink.note.replace(/^참고 · /, '')} />}
            {brand?.basisNote && <Row k="기준" v={brand.basisNote} />}
            {drink.sourceUrl && (
              <Row
                k="링크"
                v={
                  <a href={drink.sourceUrl} target="_blank" rel="noreferrer" className="text-accent underline">
                    원문 보기
                  </a>
                }
              />
            )}
          </dl>
        </Accordion>
      </Card>

      <div className="h-28" />
      <StickyFooter>
        <Button disabled={mg === null} onClick={() => setOpen(true)}>
          {mg === null ? '카페인 정보가 없어 기록할 수 없어요' : '이 음료 기록하기'}
        </Button>
      </StickyFooter>

      <IntakeTimeSheet
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={record}
        subtitle={
          <>
            {drink.name} · <span className="num">{mg !== null ? Math.round(mg) : '-'} mg</span>
          </>
        }
      />
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <dt className="w-12 shrink-0 text-ink-3">{k}</dt>
      <dd className="flex-1 text-ink-2">{v}</dd>
    </div>
  );
}
