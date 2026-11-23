import type { Campus } from '../types';

export const CAMPUSES: Campus[] = [
  { id: 'gudeok', name: '구덕캠퍼스', area: '서구 동대신동' },
  { id: 'bumin', name: '부민캠퍼스', area: '서구 부민동' },
  { id: 'seunghak', name: '승학캠퍼스', area: '사하구 하단동' },
];

export const getCampus = (id: string) => CAMPUSES.find((c) => c.id === id) ?? null;
