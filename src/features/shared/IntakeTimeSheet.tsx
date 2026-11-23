'use client';
import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { TimeWheel } from '@/components/ui/TimeWheel';
import { hm, MINUTE, ymd } from '@/lib/time';
import { useNow } from '@/hooks/useNow';

const QUICK = [
  { label: '방금', min: 0 },
  { label: '30분 전', min: 30 },
  { label: '1시간 전', min: 60 },
];
const DAYS = [
  { label: '오늘', offset: 0 },
  { label: '어제', offset: -1 },
  { label: '그저께', offset: -2 },
];

function compose(dateYmd: string, time: string) {
  const [y, mo, d] = dateYmd.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}
const minutesAgo = (min: number) => new Date(Date.now() - min * MINUTE);
const isFuture = (d: Date) => d.getTime() > Date.now() + MINUTE;
const dateWithOffset = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return ymd(d);
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (at: Date) => void;
  initial?: Date;
  title?: string;
  submitLabel?: string;
  extra?: React.ReactNode;
  subtitle?: React.ReactNode;
};

/** "언제 마셨나요?" 시트. 기본값은 현재 시각. */
export function IntakeTimeSheet({ open, onClose, onSubmit, initial, title = '언제 마셨나요?', submitLabel = '기록하기', extra, subtitle }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {open && <Body onSubmit={onSubmit} initial={initial} submitLabel={submitLabel} extra={extra} subtitle={subtitle} />}
    </BottomSheet>
  );
}

function Body({ onSubmit, initial, submitLabel, extra, subtitle }: Pick<Props, 'onSubmit' | 'initial' | 'submitLabel' | 'extra' | 'subtitle'>) {
  const start = initial ?? new Date();
  const [date, setDate] = useState(ymd(start));
  const [time, setTime] = useState(hm(start));
  const [quick, setQuick] = useState<number | null>(initial ? null : 0);
  const at = compose(date, time);
  useNow(15_000); // 열려 있는 동안 '미래 시간' 판단을 갱신
  const future = isFuture(at);

  const pickQuick = (min: number) => {
    const d = minutesAgo(min);
    setDate(ymd(d));
    setTime(hm(d));
    setQuick(min);
  };

  return (
    <div>
      {subtitle && <p className="-mt-1 mb-4 text-sub text-ink-2">{subtitle}</p>}
      <div className="grid grid-cols-3 gap-2">
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => pickQuick(q.min)}
            className={cn('pressable h-12 rounded-2xl text-sub font-semibold', quick === q.min ? 'bg-accent text-white' : 'bg-fill text-ink')}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sub font-semibold text-ink-2">직접 선택</span>
        <div className="flex gap-1.5" role="radiogroup" aria-label="날짜">
          {DAYS.map((d) => {
            const v = dateWithOffset(d.offset);
            return (
              <button
                key={d.label}
                role="radio"
                aria-checked={v === date}
                onClick={() => {
                  setDate(v);
                  setQuick(null);
                }}
                className={cn('pressable h-9 rounded-full px-3.5 text-caption font-semibold', v === date ? 'bg-ink text-white' : 'bg-fill text-ink-2')}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2">
        <TimeWheel
          value={time}
          onChange={(t) => {
            setTime(t);
            setQuick(null);
          }}
          minuteStep={1}
          hourStart={6}
        />
      </div>
      <p className={cn('mt-2 h-5 text-center text-caption', future ? 'text-ink-2' : 'text-transparent')} aria-live="polite">
        아직 오지 않은 시간은 기록할 수 없어요.
      </p>
      <div className="mt-3 space-y-2">
        <Button disabled={future} onClick={() => onSubmit(at)}>
          {submitLabel}
        </Button>
        {extra}
      </div>
    </div>
  );
}
