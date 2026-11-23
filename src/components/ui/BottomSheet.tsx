'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn';

/** 아래에서 올라오는 시트. 배경 탭, ESC, 아래로 끌어내리기로 닫힌다. */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  if (open && !mounted) {
    setMounted(true);
    setClosing(false);
  }
  if (!open && mounted && !closing) setClosing(true);

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
      setDragY(0);
    }, 220);
    return () => clearTimeout(t);
  }, [closing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        className={cn('absolute inset-0 bg-ink/30 transition-opacity duration-200', closing ? 'opacity-0' : 'animate-fade-in')}
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-[28px] bg-surface shadow-sheet outline-none',
          'pb-[max(env(safe-area-inset-bottom),16px)]',
          closing ? 'translate-y-full transition-transform duration-200' : 'animate-sheet-up',
          dragY === 0 && !closing && 'transition-transform duration-200',
        )}
      >
        <div
          className="flex cursor-grab touch-none justify-center pt-2.5 pb-1"
          onPointerDown={(e) => {
            startY.current = e.clientY;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => startY.current !== null && setDragY(Math.max(0, e.clientY - startY.current))}
          onPointerUp={() => {
            if (dragY > 90) onClose();
            else setDragY(0);
            startY.current = null;
          }}
        >
          <span className="h-1.5 w-10 rounded-full bg-fill-2" />
        </div>
        {title && <h2 className="px-6 pt-3 pb-1 text-[22px] font-bold tracking-tight">{title}</h2>}
        <div className="px-6 pt-2">{children}</div>
        {footer && <div className="px-6 pt-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
