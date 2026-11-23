'use client';
import { BarChart3, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card, SectionTitle } from '@/components/ui/Card';
import { ScreenTitle } from '@/components/ui/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { DailyBarChart, LastVsBedtimeChart } from '@/components/chart/HistoryCharts';
import { APP_CONFIG } from '@/config/app';
import { useAppData } from '@/data/store';
import { useNow } from '@/hooks/useNow';
import { buildInsights, periodStats } from '@/lib/insights';
import { dailySummary } from '@/lib/summary';
import { addDays, dayKeyOf, dayStartMinutesToHM, parseHM, shortDayLabel } from '@/lib/time';

type Range = '7' | '14';

/** 'HH:mm'을 하루 시작(04시) 기준 분으로 */
const toDayMin = (t: string | null) => (t === null ? null : (parseHM(t) - APP_CONFIG.dayStartHour * 60 + 1440) % 1440);

export function HistoryScreen() {
  const data = useAppData();
  const now = useNow();
  const [range, setRange] = useState<Range>('7');

  const model = useMemo(() => {
    if (!data) return null;
    const today = dayKeyOf(now);
    const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13)).map((d) => dailySummary(data.entries, d, data.bedtimes[d] ?? null));
    const days = last14.slice(-Number(range));
    return { days, stats: periodStats(days), insights: buildInsights(last14) };
  }, [data, now, range]);

  const exploreHref = '/explore/';

  return (
    <div className="pt-5">
      <div className="flex items-start justify-between gap-3">
        <ScreenTitle title="내 카페인 기록" />
        <div className="pt-1">
          <SegmentedControl
            label="기간"
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: '7일' },
              { value: '14', label: '14일' },
            ]}
          />
        </div>
      </div>

      {!model ? (
        <Skeleton className="h-80" />
      ) : model.stats.recordedDays === 0 ? (
        <Card>
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="아직 패턴을 보여드릴 만큼 기록이 없어요."
            body={`${APP_CONFIG.insightMinDays}일 이상 기록하면\n내 카페인 패턴을 확인할 수 있어요.`}
            action={<ButtonLink href={exploreHref}>음료 기록하기</ButtonLink>}
          />
        </Card>
      ) : (
        <>
          {model.insights.length > 0 ? (
            <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
              {model.insights.map((t, i) => (
                <div key={i} className="w-[86%] shrink-0 snap-center rounded-card bg-accent px-5 py-5 text-white shadow-[0_10px_28px_-12px_rgb(76_79_216/0.6)]">
                  <p className="flex items-center gap-1.5 text-caption font-semibold text-white/75">
                    <Sparkles size={14} /> 나의 패턴
                  </p>
                  <p className="mt-2 text-[18px] leading-snug font-bold whitespace-pre-line">{t}</p>
                </div>
              ))}
            </div>
          ) : (
            <Card className="px-5 py-5">
              <p className="text-body font-bold">아직 패턴을 보여드릴 만큼 기록이 없어요.</p>
              <p className="mt-1 text-sub text-ink-2">
                {APP_CONFIG.insightMinDays}일 이상 기록하면 내 카페인 패턴을 확인할 수 있어요. (지금 {model.stats.recordedDays}일)
              </p>
            </Card>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Card className="col-span-2 px-5 py-5">
              <p className="text-sub text-ink-2">지난 {range}일 평균 카페인</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="num text-[40px] leading-none font-bold">{Math.round(model.stats.avgDailyMg ?? 0)}</span>
                <span className="text-body font-bold text-ink-2">mg/day</span>
              </p>
              <p className="mt-2 text-caption text-ink-3">기록한 {model.stats.recordedDays}일 기준</p>
            </Card>
            <Card className="px-5 py-5">
              <p className="text-sub text-ink-2">평균 마지막 카페인</p>
              <p className="num mt-1.5 text-[28px] font-bold">
                {model.stats.avgLastIntakeMin !== null ? dayStartMinutesToHM(model.stats.avgLastIntakeMin) : '-'}
              </p>
            </Card>
            <Card className="px-5 py-5">
              <p className="text-sub text-ink-2">취침 {APP_CONFIG.lateIntakeWindowHours}시간 이내 섭취</p>
              <p className="mt-1.5 text-[28px] font-bold">
                <span className="text-body font-semibold text-ink-2">{model.stats.daysWithBedtime}일 중 </span>
                <span className="num">{model.stats.lateDays}일</span>
              </p>
            </Card>
          </div>

          <SectionTitle>일별 총 카페인</SectionTitle>
          <Card className="px-3 pt-5 pb-3">
            <DailyBarChart data={model.days.map((d) => ({ label: shortDayLabel(d.day), mg: d.dailyCaffeineMg }))} />
          </Card>

          <SectionTitle>마지막 섭취시간과 취침시간</SectionTitle>
          <Card className="px-3 pt-4 pb-3">
            <div className="mb-2 flex gap-4 px-2 text-caption text-ink-2">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-accent" aria-hidden /> 마지막 섭취
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2 border-ink" aria-hidden /> 취침 예정
              </span>
            </div>
            <LastVsBedtimeChart
              data={model.days.map((d) => ({ label: shortDayLabel(d.day), last: toDayMin(d.lastCaffeineTime), bed: d.drinkCount ? toDayMin(d.plannedBedtime) : null }))}
            />
            <p className="mt-1 px-2 text-caption text-ink-3">두 점 사이가 마지막 카페인부터 잠들 때까지의 시간이에요.</p>
          </Card>
        </>
      )}
    </div>
  );
}
