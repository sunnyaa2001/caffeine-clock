'use client';
// 입장코드 기반 서버 동기화.
// 기록은 먼저 기기에 저장하고(화면 즉시 반영), 서버 전송은 보낼 목록(outbox)에 쌓아 순서대로 보낸다.
// 전송이 실패하면 목록에 남겨 두었다가 다음 기록, 앱 재방문, 네트워크 복구 때 다시 보낸다.
import { useSyncExternalStore } from 'react';
import { BACKEND, isRemoteMode } from '@/config/backend';

const KEYS = { session: 'cc.v1.session', outbox: 'cc.v1.outbox' } as const;

type Op = { fn: string; args: Record<string, unknown> };
export type SyncState = { code: string | null; pending: number; offline: boolean };

const read = <T,>(k: string, fallback: T): T => {
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => {
  try {
    if (v === null) window.localStorage.removeItem(k);
    else window.localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* 저장 불가 환경 */
  }
};

let sync: SyncState | null = null;
let outbox: Op[] = [];
let flushing = false;
const listeners = new Set<() => void>();
let onInvalidCode: (() => void) | null = null;

function ensure(): SyncState {
  if (!sync) {
    outbox = read<Op[]>(KEYS.outbox, []);
    sync = { code: read<string | null>(KEYS.session, null), pending: outbox.length, offline: false };
  }
  return sync;
}
function setSync(patch: Partial<SyncState>) {
  sync = { ...ensure(), ...patch };
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useSync = () => useSyncExternalStore(subscribe, ensure, () => null);
export const currentCode = () => ensure().code;
export const setInvalidCodeHandler = (fn: () => void) => {
  onInvalidCode = fn;
};

export class RemoteError extends Error {
  constructor(public kind: 'invalid_code' | 'network' | 'server') {
    super(kind);
  }
}

export async function rpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: BACKEND.supabaseAnonKey,
        Authorization: `Bearer ${BACKEND.supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });
  } catch {
    throw new RemoteError('network');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new RemoteError(body.includes('invalid_code') ? 'invalid_code' : 'server');
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const normalizeCode = (s: string) => s.replace(/\s/g, '').toUpperCase();

export function startSession(code: string) {
  write(KEYS.session, code);
  outbox = [];
  write(KEYS.outbox, outbox);
  setSync({ code, pending: 0, offline: false });
}
export function endSession() {
  write(KEYS.session, null);
  outbox = [];
  write(KEYS.outbox, outbox);
  setSync({ code: null, pending: 0 });
}

/** 서버로 보낼 작업을 쌓고 바로 전송을 시도한다. */
export function enqueue(fn: string, args: Record<string, unknown>) {
  if (!isRemoteMode() || !ensure().code) return;
  outbox.push({ fn, args });
  write(KEYS.outbox, outbox);
  setSync({ pending: outbox.length });
  void flush();
}

export async function flush(): Promise<boolean> {
  const code = ensure().code;
  if (!isRemoteMode() || !code || flushing) return outbox.length === 0;
  flushing = true;
  try {
    while (outbox.length) {
      const op = outbox[0];
      try {
        await rpc(op.fn, { p_code: code, ...op.args });
      } catch (e) {
        const kind = e instanceof RemoteError ? e.kind : 'server';
        if (kind === 'invalid_code') {
          onInvalidCode?.();
          return false;
        }
        setSync({ offline: true });
        return false;
      }
      outbox.shift();
      write(KEYS.outbox, outbox);
      setSync({ pending: outbox.length, offline: false });
    }
    return true;
  } finally {
    flushing = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flush());
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void flush());
}
