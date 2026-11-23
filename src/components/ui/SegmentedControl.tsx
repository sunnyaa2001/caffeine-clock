'use client';
import { cn } from './cn';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div role="radiogroup" aria-label={label} className="relative grid rounded-full bg-fill p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-surface shadow-[0_1px_3px_rgb(23_23_28/0.12)] transition-transform duration-300 ease-out"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn('relative z-10 h-9 min-w-14 px-3 text-sub font-semibold transition-colors', o.value === value ? 'text-ink' : 'text-ink-3')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
