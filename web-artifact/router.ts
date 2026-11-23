// 아티팩트(단일 페이지)용 메모리 라우터. next/link, next/navigation 대신 사용한다.
import { useSyncExternalStore } from 'react';

const stack: string[] = ['/'];
const listeners = new Set<() => void>();
const emit = () => {
  listeners.forEach((l) => l());
  window.scrollTo(0, 0);
};
export const normalize = (p: string) => (p.endsWith('/') || p === '' ? p || '/' : p + '/');
export const currentPath = () => stack[stack.length - 1];
export const navigate = (p: string) => {
  stack.push(normalize(p));
  emit();
};
export const replace = (p: string) => {
  stack[stack.length - 1] = normalize(p);
  emit();
};
export const back = () => {
  if (stack.length > 1) stack.pop();
  else stack[0] = '/';
  emit();
};
export const canGoBack = () => stack.length > 1;
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const usePath = () => useSyncExternalStore(subscribe, currentPath, currentPath);
