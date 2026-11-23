'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Search, Sun } from 'lucide-react';
import { useAppData } from '@/data/store';
import { cn } from './cn';

export function BottomNav() {
  const path = usePathname();
  const data = useAppData();
  const last = data?.settings.lastCampusId;
  const items = [
    { href: '/', label: '오늘', icon: Sun, active: path === '/' || path.startsWith('/today') },
    { href: last ? `/explore/${last}/` : '/explore/', label: '음료 찾기', icon: Search, active: path.startsWith('/explore') },
    { href: '/history/', label: '기록', icon: CalendarDays, active: path.startsWith('/history') },
  ];
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] bg-surface/85 backdrop-blur-xl shadow-float pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid h-16 grid-cols-3">
        {items.map(({ href, label, icon: Icon, active }) => (
          <li key={label}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn('pressable flex h-full flex-col items-center justify-center gap-1', active ? 'text-accent' : 'text-ink-3')}
            >
              <Icon size={24} strokeWidth={active ? 2.4 : 2} aria-hidden />
              <span className={cn('text-[12px] leading-none', active ? 'font-bold' : 'font-medium')}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
