import type { ReactNode } from 'react';
import { cn } from './cn';

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center animate-fade-up">
      {icon && <div className="mb-5 grid size-16 place-items-center rounded-full bg-accent-soft text-accent">{icon}</div>}
      <p className="text-headline font-bold whitespace-pre-line">{title}</p>
      {body && <p className="mt-2 text-sub text-ink-2 whitespace-pre-line">{body}</p>}
      {action && <div className="mt-7 w-full max-w-[260px]">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-card bg-fill', className)} />;
}

export function InlineNotice({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-fill px-4 py-3 text-sub text-ink-2">{children}</p>;
}
