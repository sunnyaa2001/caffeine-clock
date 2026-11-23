'use client';
import { cn } from './cn';

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-accent' : 'bg-fill-2')}
    >
      <span className={cn('absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform duration-200', checked && 'translate-x-5')} />
    </button>
  );
}
