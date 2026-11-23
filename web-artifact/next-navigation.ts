import { back, canGoBack, navigate, replace, usePath } from './router';

export const usePathname = () => usePath().replace(/\/$/, '') || '/';
export const useRouter = () => ({ push: navigate, replace, back: () => (canGoBack() ? back() : navigate('/')), refresh: () => {}, prefetch: () => {} });
export function notFound(): never {
  throw new Error('NOT_FOUND');
}
