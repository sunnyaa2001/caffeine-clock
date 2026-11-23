import type { ComponentProps } from 'react';
import { cn } from './cn';

export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('bg-surface rounded-card shadow-card', className)} {...rest} />;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between px-1 mb-3 mt-8">
      <h2 className="text-headline font-bold">{children}</h2>
      {action}
    </div>
  );
}
