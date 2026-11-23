import { cn } from './cn';

export function ChipGroup<T extends string>({
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
  return (
    <div role="radiogroup" aria-label={label} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'pressable h-10 shrink-0 rounded-full px-4 text-sub font-semibold',
              on ? 'bg-ink text-white' : 'bg-surface text-ink-2 shadow-[0_1px_2px_rgb(23_23_28/0.05)]',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
