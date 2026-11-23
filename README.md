# Caffeine Clock

내가 마신 음료의 카페인, 마신 시각, 오늘 취침 예정시간을 연결해서
**잠들 때 카페인이 얼마나 남아 있을지** 추정해 보여주는 모바일 우선 웹앱입니다.
교육·연구용 도구이며 의료 진단 도구가 아닙니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 계산 로직 단위 테스트
npm run build      # 정적 사이트를 out/ 에 생성 (어디에나 업로드 가능)
```

## 구조

| 위치 | 내용 |
| --- | --- |
| `src/config/app.ts` | 앱 이름, 반감기(5h, 범위 4–6h), 하루 기준 시각 등 설정값 |
| `src/lib/caffeine.ts` | 잔존량 계산 (순수 함수) |
| `src/lib/summary.ts`, `insights.ts` | 연구용 일일 지표, 인사이트 문구 |
| `src/data/catalog/` | 캠퍼스, 카페(SAMPLE), 메뉴 데이터 |
| `src/data/repository.ts` | 저장소 인터페이스 (Supabase로 교체 가능) |
| `src/data/localRepository.ts` | localStorage 구현 |
| `src/components/ui/` | 디자인 시스템 컴포넌트 |
| `src/features/` | 화면별 기능 |

## 메뉴 데이터

- 원본: `data-source/cafe-menu-caffeine.xlsx` (11개 브랜드 × 10개 메뉴, 2026.11.16 확인)
- 변환: `npm run import-menu` → `src/data/catalog/drinks.generated.ts`
- 카페인 값은 원본 그대로 옮기며 임의로 만들지 않습니다. 값이 없으면 "카페인 정보 미확인"으로 표시합니다.
- 텐퍼센트커피 일부 수치는 "참고 수치"(공개 후기 인용)로 따로 표시합니다.
- 카테고리(커피/라떼 등)는 원본에 없어 메뉴명으로 분류합니다. 수정은 `scripts/import-xlsx.mjs`의 `OVERRIDES`에서 합니다.

## SAMPLE 데이터

`src/data/catalog/cafes.sample.ts`: 캠퍼스별 실제 지점 자료가 아직 없어 11개 브랜드를 세 캠퍼스 모두에 예시로 연결했습니다.
화면에도 "예시 지점"으로 표시됩니다. 실제 자료가 생기면 이 파일만 교체하세요.

## localStorage 키

| 키 | 내용 |
| --- | --- |
| `cc.v1.settings` | 온보딩 완료, 기본 취침시간, 최근 캠퍼스, 체중(선택), 알림 설정 |
| `cc.v1.entries` | 섭취 기록 (기록 당시 음료 정보 스냅샷 포함) |
| `cc.v1.bedtimes` | 날짜별 취침 예정시간 |
| `cc.meta` | 스키마 버전, 최초 사용일 |

설정 화면에서 일별 요약/섭취 기록을 CSV로 내보낼 수 있습니다. 외부 서버로 전송되는 데이터는 없습니다.

## 배포

`npm run build` 후 `out/` 폴더를 Vercel, Netlify, GitHub Pages 등에 올리면 됩니다.

## 웹 링크(Claude 아티팩트) 빌드

`npm run build:artifact` → `web-artifact/dist/` 에 단일 페이지 버전(index.html + app.js)이 만들어집니다.
같은 화면 코드를 쓰고, Next.js 라우팅만 메모리 라우터로 바꿔 끼웁니다. 아티팩트 안에서는 CSV 파일 저장이 막혀 있습니다.
