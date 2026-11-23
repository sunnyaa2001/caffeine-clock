'use client';
import { Check } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const Ctx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; key: number } | null>(null);
  const show = useCallback((text: string) => {
    const key = Date.now();
    setMsg({ text, key });
    setTimeout(() => setMsg((m) => (m?.key === key ? null : m)), 2200);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),12px)] z-[60] flex justify-center px-5">
        {msg && (
          <div key={msg.key} className="animate-fade-up flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sub font-semibold text-white shadow-card">
            <span className="animate-pop grid size-6 place-items-center rounded-full bg-accent">
              <Check size={15} strokeWidth={3} />
            </span>
            {msg.text}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
