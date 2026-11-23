'use client';
import { KeyRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/config/app';
import { isRemoteMode } from '@/config/backend';
import { RemoteError, useSync } from '@/data/remote';
import { actions } from '@/data/store';

/** 서버 모드에서 입장코드가 없으면 첫 화면으로 코드 입력을 보여준다. */
export function EntryGate() {
  const sync = useSync();
  const refreshed = useRef(false);

  // 이미 입장한 기기라면 앱을 열 때마다 서버 기록과 맞춘다.
  useEffect(() => {
    if (!isRemoteMode() || !sync?.code || refreshed.current) return;
    refreshed.current = true;
    void actions.refresh(sync.code);
  }, [sync?.code]);

  if (!isRemoteMode() || !sync || sync.code) return null;
  return <EntryScreen />;
}

function EntryScreen() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await actions.login(code);
    } catch (err) {
      const kind = err instanceof RemoteError ? err.kind : 'server';
      setError(
        kind === 'invalid_code'
          ? '등록되지 않은 코드예요. 연구팀에게 받은 코드를 다시 확인해주세요.'
          : '정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="입장코드 입력" className="fixed inset-0 z-[80] bg-bg animate-fade-in">
      <form
        onSubmit={submit}
        className="mx-auto flex h-full max-w-[480px] flex-col px-6 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),24px)]"
      >
        <div className="flex h-12 items-center">
          <span className="text-sub font-bold text-ink-2">{APP_CONFIG.name}</span>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-8 grid size-20 place-items-center rounded-[28px] bg-accent-soft text-accent">
            <KeyRound size={34} strokeWidth={2} />
          </div>
          <h1 className="text-[26px] leading-[1.4] font-bold tracking-tight">입장코드를 입력해주세요</h1>
          <p className="mt-2 text-body text-ink-2">연구팀에게 받은 코드로 들어오면, 기기를 바꿔도 내 기록이 이어져요.</p>
          <label htmlFor="entry-code" className="sr-only">
            입장코드
          </label>
          <input
            id="entry-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CC-0000"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            enterKeyHint="go"
            className="num mt-8 h-16 w-full rounded-2xl bg-surface px-5 text-center text-[26px] font-bold tracking-[0.12em] shadow-card outline-none placeholder:text-ink-3/50 focus:ring-2 focus:ring-accent"
          />
          <p className="mt-3 min-h-10 text-sub text-ink-2" aria-live="polite">
            {error}
          </p>
        </div>
        <Button type="submit" disabled={!code.trim() || busy}>
          {busy ? '확인하는 중…' : '시작하기'}
        </Button>
      </form>
    </div>
  );
}
