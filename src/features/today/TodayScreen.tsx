'use client';
import { ChevronRight, CupSoda, Moon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card, SectionTitle } from '@/components/ui/Card';
import { CountUp } from '@/components/ui/CountUp';
import { BackBar } from '@/components/ui/PageHeader';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { DecayChart } from '@/components/chart/DecayChart';
import { APP_CONFIG } from '@/config/app';
import { useAppData } from '@/data/store';
import { useNow } from '@/hooks/useNow';
import { useTodayModel } from '@/hooks/useTodayModel';
import { formatMg } from '@/lib/caffeine';
import { HOUR, hm } from '@/lib/time';
import { BedtimeSheet } from '@/features/shared/BedtimeSheet';
import { IntakeTimeline } from './IntakeTimeline';
import { MeaningCard } from '@/features/shared/CaffeineMeaning';

export function TodayScreen() {
  const data = useAppData();
  const now = useNow();
  const m = useTodayModel(data, now);
  const [sheet, setSheet] = useState(false);
  const exploreHref = '/explore/';

  if (!m) return <Skeleton className="mt-16 h-[520px]" />;

  if (m.todays.length === 0) {
    return (
      <>
        <BackBar fallback="/" crumbs={['오늘']} />
        <EmptyState
          icon={<CupSoda size={28} />}
          title="아직 오늘 기록한 카페인이 없어요."
          body="첫 음료를 기록해볼까요?"
          action={<ButtonLink href={exploreHref}>음료 찾기</ButtonLink>}
        />
      </>
    );
  }

  const H = APP_CONFIG.halfLifeHours;
  const last = m.last!;
  const lastAt = new Date(last.intakeAt).getTime();
  const story = [
    { at: lastAt, pct: '100%' },
    { at: lastAt + H * HOUR, pct: '약 50%' },
    { at: lastAt + 2 * H * HOUR, pct: '약 25%' },
  ];

  return (
    <>
      <BackBar fallback="/" crumbs={['오늘']} />

      <section className="pt-2 pb-2">
        <button onClick={() => setSheet(true)} className="pressable -ml-1 inline-flex h-10 items-center gap-1.5 rounded-full bg-accent-mist px-3 text-body font-bold text-accent">
          <Moon size={17} strokeWidth={2.4} />
          <span><span className="num">{m.bedtime}</span>에 잠든다면</span>
          <ChevronRight size={17} className="opacity-70" />
        </button>
        <p className="mt-4 flex items-baseline gap-2">
          <span className="text-[22px] font-semibold text-ink-2">약</span>
          <CountUp value={Math.round(m.atBed.mid)} className="num text-[72px] leading-none font-bold tracking-[-0.04em]" />
          <span className="text-[26px] font-bold text-ink-2">mg</span>
        </p>
        <p className="mt-3 text-headline font-semibold">카페인이 남아 있을 것으로 예상돼요.</p>
        <p className="mt-1 text-sub text-ink-3">일반적인 반감기 {H}시간 기준</p>
      </section>

      <Card className="mt-5 flex items-center justify-between gap-3 px-5 py-4">
        <span className="text-sub text-ink-2">개인차를 고려한 예상범위</span>
        <span className="num text-body font-bold">
          약 {Math.round(m.atBed.low)}–{Math.round(m.atBed.high)} mg
        </span>
      </Card>

      <div className="mt-3">
        <MeaningCard mg={m.atBed.mid} dailyTotal={m.total} />
      </div>

      <Card className="mt-3 px-3 pt-4 pb-3">
        <div className="mb-1 flex items-center justify-between px-2">
          <p className="text-sub font-semibold text-ink-2">시간에 따른 예상 잔존량</p>
          <p className="flex items-center gap-1.5 text-caption text-ink-3">
            <span className="inline-block h-2.5 w-4 rounded-sm bg-[#e3e3fa]" aria-hidden /> 반감기 {APP_CONFIG.halfLifeRange.fast}–{APP_CONFIG.halfLifeRange.slow}시간
          </p>
        </div>
        <DecayChart doses={m.doses} start={m.chartStart} end={m.chartEnd} bedtime={m.bedtimeMs} now={now} />
        <p className="mt-1 px-2 text-caption text-ink-3">그래프를 누르면 시간별 예상치를 볼 수 있어요. 흰 점은 마신 시각이에요.</p>
      </Card>

      <SectionTitle>카페인은 시간이 지나면서 이런 식으로 감소해요.</SectionTitle>
      <p className="-mt-2 mb-3 px-1 text-caption text-ink-3">
        {last.drinkSnapshot.name} {Math.round(last.drinkSnapshot.caffeineMg)} mg 기준
      </p>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {story.map((s, i) => (
          <Card key={i} className="w-[132px] shrink-0 px-4 py-4">
            <p className="num text-sub font-semibold text-ink-2">{hm(s.at)}</p>
            <p className="num mt-2 text-[26px] font-bold" style={{ color: i === 0 ? '#4c4fd8' : i === 1 ? '#7577e0' : '#9d9fe8' }}>
              {s.pct}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fill" aria-hidden>
              <div className="h-full rounded-full bg-accent" style={{ width: `${100 / 2 ** i}%`, opacity: 1 - i * 0.25 }} />
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>오늘의 요약</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="오늘 총 섭취" value={formatMg(m.total)} />
        <Stat label="마신 음료" value={`${m.todays.length}잔`} />
        <Stat label="마지막 섭취" value={hm(last.intakeAt)} />
        <Stat label="취침 시 예상" value={`약 ${formatMg(m.atBed.mid)}`} />
      </div>

      <SectionTitle
        action={
          <Link href={exploreHref} className="text-sub font-semibold text-accent">
            + 추가
          </Link>
        }
      >
        오늘 마신 음료
      </SectionTitle>
      <IntakeTimeline entries={m.todays} />

      <p className="mt-8 px-1 text-caption text-ink-3">
        표시되는 값은 일반적인 반감기를 기반으로 한 추정값이며 실제 혈중 카페인 농도와 다를 수 있어요. 의료적 판단이나 진단을 제공하지 않아요.{' '}
        <Link href="/about/" className="font-semibold text-ink-2 underline underline-offset-2">
          자세히
        </Link>
      </p>

      <BedtimeSheet open={sheet} onClose={() => setSheet(false)} day={m.day} value={m.bedtime} doses={m.doses} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-caption text-ink-2">{label}</p>
      <p className="num mt-1.5 text-[22px] font-bold">{value}</p>
    </Card>
  );
}
