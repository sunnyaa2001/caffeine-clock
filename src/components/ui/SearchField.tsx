'use client';
import { Search, X } from 'lucide-react';

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-12 items-center gap-2.5 rounded-2xl bg-fill px-4 text-ink-3 focus-within:bg-surface focus-within:shadow-card transition-colors">
      <Search size={19} strokeWidth={2.2} aria-hidden className="shrink-0" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-ink-3 outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="검색어 지우기" className="grid size-7 place-items-center rounded-full bg-ink-3/20 text-ink-2">
          <X size={14} strokeWidth={2.6} />
        </button>
      )}
    </label>
  );
}
