'use client';
import { useEffect, useRef } from 'react';
import { cn } from './cn';

const ITEM = 44;
const VISIBLE = 5;

/** 스크롤 스냅 휠 한 열 */
function Wheel({ values, index, onChange, label }: { values: string[]; index: number; onChange: (i: number) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userScrolling = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || userScrolling.current) return;
    const target = index * ITEM;
    if (Math.abs(el.scrollTop - target) > 2) el.scrollTo({ top: target, behavior: el.scrollTop === 0 && target > 0 ? 'auto' : 'smooth' });
  }, [index]);

  return (
    <div className="relative flex-1">
      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.min(values.length - 1, index + 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.max(0, index - 1)); }
        }}
        onScroll={(e) => {
          userScrolling.current = true;
          const el = e.currentTarget;
          if (settle.current) clearTimeout(settle.current);
          settle.current = setTimeout(() => {
            const i = Math.max(0, Math.min(values.length - 1, Math.round(el.scrollTop / ITEM)));
            userScrolling.current = false;
            if (i !== index) onChange(i);
          }, 90);
        }}
        className="no-scrollbar relative z-10 snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        style={{ height: ITEM * VISIBLE, paddingBlock: ITEM * 2, maskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)' }}
      >
        {values.map((v, i) => (
          <div
            key={v + i}
            role="option"
            aria-selected={i === index}
            onClick={() => onChange(i)}
            className={cn(
              'num flex snap-center items-center justify-center text-[24px] transition-colors',
              i === index ? 'font-bold text-ink' : 'font-medium text-ink-3',
            )}
            style={{ height: ITEM }}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 시:분 휠. hourOrder로 시작 시각을 바꿀 수 있다 (취침시간은 18시부터). */
export function TimeWheel({
  value,
  onChange,
  minuteStep = 5,
  hourStart = 0,
}: {
  value: string;
  onChange: (v: string) => void;
  minuteStep?: number;
  hourStart?: number;
}) {
  const [h, m] = value.split(':').map(Number);
  const hours = Array.from({ length: 24 }, (_, i) => (hourStart + i) % 24);
  const minutes = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);
  const hIdx = hours.indexOf(h);
  const mIdx = Math.max(0, minutes.findIndex((x) => x >= m - minuteStep / 2 && x <= m + minuteStep / 2));
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="relative flex items-center gap-2 px-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-4 top-1/2 h-11 -translate-y-1/2 rounded-2xl bg-fill" />
      <Wheel label="시" values={hours.map(pad)} index={hIdx} onChange={(i) => onChange(`${pad(hours[i])}:${pad(minutes[mIdx])}`)} />
      <span className="relative z-10 text-[24px] font-bold text-ink-3">:</span>
      <Wheel label="분" values={minutes.map(pad)} index={mIdx} onChange={(i) => onChange(`${pad(hours[hIdx])}:${pad(minutes[i])}`)} />
    </div>
  );
}
