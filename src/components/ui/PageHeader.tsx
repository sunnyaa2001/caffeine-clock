'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export function BackBar({ fallback, crumbs, right }: { fallback: string; crumbs?: string[]; right?: ReactNode }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 -mx-5 flex h-14 items-center gap-1 bg-bg/85 px-2 backdrop-blur-xl">
      <button
        onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
        aria-label="뒤로"
        className="pressable grid size-11 place-items-center rounded-full text-ink"
      >
        <ChevronLeft size={26} strokeWidth={2.2} />
      </button>
      {crumbs && (
        <nav aria-label="현재 단계" className="min-w-0 flex-1 truncate text-sub text-ink-3">
          {crumbs.map((c, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 text-ink-3/60">›</span>}
              <span className={i === crumbs.length - 1 ? 'font-semibold text-ink-2' : ''}>{c}</span>
            </span>
          ))}
        </nav>
      )}
      <div className="ml-auto pr-2">{right}</div>
    </div>
  );
}

export function ScreenTitle({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <header className="pt-2 pb-5">
      <h1 className="text-title font-bold">{title}</h1>
      {subtitle && <p className="mt-1.5 text-body text-ink-2">{subtitle}</p>}
    </header>
  );
}
