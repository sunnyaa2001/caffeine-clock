// 앱 이름과 계산 기준값은 여기에서만 바꾼다.
export const APP_CONFIG = {
  name: 'Caffeine Clock',
  tagline: '오늘 카페인, 얼마나 남아 있을까요?',
  /** 중앙 추정 반감기(시간) */
  halfLifeHours: 5,
  /** 예상범위: 빠른 대사 / 느린 대사 가정 */
  halfLifeRange: { fast: 4, slow: 6 },
  /** 하루가 바뀌는 시각. 새벽 1시에 마신 음료는 전날 기록으로 본다. */
  dayStartHour: 4,
  /** 이 시각 전의 취침시간은 다음 날짜로 해석한다 (예: 00:30). */
  bedtimeNextDayBeforeHour: 12,
  defaultBedtime: '00:30',
  /** 취침 전 몇 시간 이내 섭취를 따로 집계할지 (연구 지표) */
  lateIntakeWindowHours: 6,
  /** 인사이트를 보여주기 위한 최소 기록 일수 */
  insightMinDays: 3,
  /** 취침 시점 계산에 포함할 과거 기록 범위(시간) */
  lookbackHours: 48,
} as const;
