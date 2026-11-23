// SAMPLE 데이터: 캠퍼스별 실제 지점 조사 자료가 아직 없어서
// 메뉴 데이터가 있는 11개 브랜드를 세 캠퍼스 모두에 예시로 연결했다.
// 실제 지점 자료가 생기면 이 파일만 교체하면 된다 (isSample: false).
import type { Cafe } from '../types';
import { BRANDS } from './drinks.generated';

export const CAFES: Cafe[] = BRANDS.map((b) => ({
  id: b.brandId,
  brandId: b.brandId,
  brandName: b.brandName,
  branchName: null,
  campusIds: ['gudeok', 'bumin', 'seunghak'],
  isSample: true,
}));
