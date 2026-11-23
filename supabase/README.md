# 연구팀용 서버 안내 (Supabase)

## 처음 한 번
1. Supabase 프로젝트 → SQL Editor → `schema.sql` 내용을 붙여 넣고 Run
2. 입장코드 발급: `node scripts/make-codes.mjs 30` → `codes.sql`을 SQL Editor에서 Run
   - `codes.csv`에 참가자 번호(P01…)와 코드 목록이 있어요. 참가자에게 코드 하나씩 전달하세요.
   - 이름, 연락처 같은 개인정보는 서버에 넣지 말고 연구팀이 따로 보관하세요.

## 데이터 받기 (CSV)
- Table Editor → `intake_entries` : 모든 섭취 기록 (삭제한 기록은 `deleted_at`에 시각이 있음)
- Table Editor → `bedtimes` : 날짜별 취침 예정시간
- SQL Editor → `select * from research_daily_summary;` 실행 후 결과를 Download CSV
  - 참가자·날짜별 하루 총 카페인, 첫/마지막 섭취 시각, 취침 예정시간, 취침 시 예상 잔존량,
    음료 수, 취침 6시간 이내 섭취 여부

## 참가자 코드 관리
- 코드 막기: `update participants set active = false where code = 'CC-XXXX';`
- 코드 추가: `insert into participants (code, label) values ('CC-XXXX', 'P31');`

## 보안 메모
- 앱은 anon key와 입장코드로만 접근하고, 테이블은 직접 읽거나 쓸 수 없어요 (RLS + 함수로만 접근).
- service_role key는 앱이나 저장소에 절대 넣지 마세요.
