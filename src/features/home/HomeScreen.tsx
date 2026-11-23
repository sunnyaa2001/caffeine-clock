'use client';
import { ChevronRight, CupSoda, Info, Moon, Plus, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CountUp } from '@/components/ui/CountUp';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { DecayChart } from '@/components/chart/DecayChart';
import { APP_CONFIG } from '@/config/app';
import { useAppData } from '@/data/store';
import { useNow } from '@/hooks/useNow';
import { useTodayModel } from '@/hooks/useTodayModel';
import { formatMg } from '@/lib/caffeine';
import { hm } from '@/lib/time';
import { BedtimeSheet } from '@/features/shared/BedtimeSheet';
import { MeaningLine } from '@/features/shared/CaffeineMeaning';

export function HomeScreen() {
  const data = useAppData();
  const now = useNow();
  const m = useTodayModel(data, now);
  const [sheet, setSheet] = useState(false);
  const exploreHref = '/explore/';

  return (
    <>
      <header className="flex items-start justify-between pt-5 pb-6">
        <div>
          <h1 className="text-title font-bold">{APP_CONFIG.name}</h1>
          <p className="mt-1 text-body text-ink-2">{APP_CONFIG.tagline}</p>
        </div>
        <div className="-mr-2 flex">
          <Link href="/about/" aria-label="카페인에 대해" className="pressable grid size-11 place-items-center rounded-full text-ink-2">
            <Info size={22} />
          </Link>
          <Link href="/settings/" aria-label="설정" className="pressable grid size-11 place-items-center rounded-full text-ink-2">
            <Settings2 size={22} />
          </Link>
        </div>
      </header>

      {!m ? (
        <div className="space-y-3">
          <Skeleton className="h-[330px]" />
          <Skeleton className="h-24" />
        </div>
      ) : m.todays.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CupSoda size={28} />}
            title="아직 오늘 기록한 카페인이 없어요."
            body="오늘 마신 음료를 기록해보세요."
            action={
              <ButtonLink href={exploreHref} icon={<Plus size={20} strokeWidth={2.6} />}>
                음료 기록하기
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <button
                onClick={() => setSheet(true)}
                className="pressable -ml-1 inline-flex h-10 items-center gap-1.5 rounded-full bg-accent-mist pr-3 pl-3 text-sub font-semibold text-accent"
              >
                <Moon size={16} strokeWidth={2.4} />
                취침 예정 <span className="num">{m.bedtime}</span>
                <ChevronRight size={16} className="-mr-1 opacity-70" />
              </button>
              {!m.bedtimeIsSet && <span className="ml-2 text-caption text-ink-3">눌러서 바꿀 수 있어요</span>}
            </div>
            <Link href="/today/" className="block px-5 pb-4" aria-label="오늘 분석 자세히 보기">
              <p className="mt-5 text-sub font-medium text-ink-2">{m.bedtimePassed ? '취침 예정 시각의 예상 잔존 카페인' : '예상 잔존 카페인'}</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-headline font-semibold text-ink-2">약</span>
                <CountUp value={Math.round(m.atBed.mid)} className="num text-display font-bold" />
                <span className="text-[22px] font-bold text-ink-2">mg</span>
              </p>
              <p className="mt-2 text-caption text-ink-3">일반적인 반감기를 적용한 추정치예요.</p>
              <MeaningLine mg={m.atBed.mid} />
              <div className="-mx-1 mt-3">
                <DecayChart variant="mini" doses={m.doses} start={m.chartStart} end={m.chartEnd} bedtime={m.bedtimeMs} now={now} />
              </div>
              <span className="mt-1 flex items-center justify-end gap-0.5 text-sub font-semibold text-accent">
                자세히 보기 <ChevronRight size={16} />
              </span>
            </Link>
          </Card>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <Tile label="오늘 총 카페인" value={formatMg(m.total)} />
            <Tile label="마지막 섭취" value={m.last ? hm(m.last.intakeAt) : '-'} />
            <Tile label="마신 음료" value={`${m.todays.length}잔`} />
          </div>

          <div className="mt-6">
            <ButtonLink href={exploreHref} variant="secondary" icon={<Plus size={20} strokeWidth={2.6} />}>
              음료 기록하기
            </ButtonLink>
          </div>
        </>
      )}

      {m && <BedtimeSheet open={sheet} onClose={() => setSheet(false)} day={m.day} value={m.bedtime} doses={m.doses} />}
    </>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-4 py-4">
      <p className="text-caption text-ink-2">{label}</p>
      <p className="num mt-1.5 text-[19px] font-bold">{value}</p>
    </Card>
  );
}
