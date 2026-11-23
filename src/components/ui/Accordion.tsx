'use client';
import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { cn } from './cn';

export function Accordion({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="pressable flex min-h-11 w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-body font-semibold">{title}</span>
        <ChevronDown size={20} className={cn('shrink-0 text-ink-3 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div id={id} className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="pt-2 pb-1 text-sub text-ink-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
