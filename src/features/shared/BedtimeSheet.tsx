'use client';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { TimeWheel } from '@/components/ui/TimeWheel';
import { actions } from '@/data/store';
import type { DayKey } from '@/data/types';
import { estimateAt, type Dose } from '@/lib/caffeine';
import { bedtimeAt } from '@/lib/time';

const QUICK = ['23:00', '00:00', '01:00', '02:00'];

/** 취침시간을 고르는 즉시 저장되고 결과가 바뀐다. 별도의 저장 버튼이 없다. */
export function BedtimeSheet({ open, onClose, day, value, doses }: { open: boolean; onClose: () => void; day: DayKey; value: string; doses: Dose[] }) {
  const set = (t: string) => actions.setBedtime(day, t);
  const est = estimateAt(doses, bedtimeAt(day, value).getTime()).mid;
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="오늘 몇 시쯤 주무실 예정인가요?"
      footer={<Button onClick={onClose}>확인</Button>}
    >
      <div className="no-scrollbar -mx-6 mb-4 flex gap-2 overflow-x-auto px-6">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => set(q)}
            className={cn('pressable num h-10 shrink-0 rounded-full px-4 text-sub font-semibold', q === value ? 'bg-ink text-white' : 'bg-fill text-ink-2')}
          >
            {q}
          </button>
        ))}
      </div>
      <TimeWheel value={value} onChange={set} hourStart={18} minuteStep={5} />
      {doses.length > 0 && (
        <p className="mt-4 text-center text-sub text-ink-2" aria-live="polite">
          이때 예상 잔존 카페인 <b className="num text-accent">약 {Math.round(est)} mg</b>
        </p>
      )}
    </BottomSheet>
  );
}
