'use client';
import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const noop = () => () => {};

/** 하단 네비게이션 바로 위에 고정되는 CTA 영역. 페이지 전환 애니메이션의 영향을 받지 않도록 body에 붙인다. */
export function StickyFooter({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg/95 to-transparent px-5 pt-6 pb-3 animate-fade-in">
      {children}
    </div>,
    document.body,
  );
}
