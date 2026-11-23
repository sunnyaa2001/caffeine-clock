import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'lg' | 'md' | 'sm';

const base =
  'pressable inline-flex items-center justify-center gap-2 font-semibold select-none disabled:opacity-40 disabled:pointer-events-none';
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[0_6px_16px_-6px_rgb(76_79_216/0.55)] active:bg-accent-strong',
  secondary: 'bg-fill text-ink active:bg-fill-2',
  ghost: 'text-accent active:bg-accent-mist',
};
const sizes: Record<Size, string> = {
  lg: 'h-14 px-6 rounded-btn text-[17px] w-full',
  md: 'h-12 px-5 rounded-btn text-body',
  sm: 'h-10 px-4 rounded-full text-sub',
};

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; className?: string; children: ReactNode };

export function Button({ variant = 'primary', size = 'lg', icon, className, children, ...rest }: Common & ComponentProps<'button'>) {
  return (
    <button type="button" className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', size = 'lg', icon, className, children, href }: Common & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {icon}
      {children}
    </Link>
  );
}
