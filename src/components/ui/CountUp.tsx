'use client';
import { useEffect, useRef, useState } from 'react';

/** 숫자가 바뀔 때 부드럽게 올라가거나 내려간다. */
export function CountUp({ value, duration = 600, className }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const a = from.current;
    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = a + (value - a) * eased;
      setShown(v);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      from.current = value;
    };
  }, [value, duration]);
  return <span className={className}>{Math.round(shown)}</span>;
}
