export type CampusId = 'gudeok' | 'bumin' | 'seunghak';

export type Campus = {
  id: CampusId;
  name: string;
  area: string;
};

/** 메뉴는 브랜드 단위로 동일하다고 보고 브랜드에 연결한다. */
export type Brand = {
  brandId: string;
  brandName: string;
  basisNote: string | null;
};

export type Cafe = {
  id: string;
  brandId: string;
  brandName: string;
  branchName: string | null;
  campusIds: CampusId[];
  address?: string;
  /** 지점·캠퍼스 매핑이 실제 조사 자료가 아닌 예시라면 true */
  isSample: boolean;
};

export type DrinkCategory = 'coffee' | 'coldbrew' | 'latte' | 'noncoffee' | 'decaf';

export type SourceType = 'official' | 'reference' | 'unverified';

export type Drink = {
  id: string;
  brandId: string;
  name: string;
  category: DrinkCategory;
  temperature: 'ice' | 'hot' | null;
  size: string | null;
  volumeMl: number | null;
  /** 원문 용량 표기 (예: '330 g', '20 oz') */
  servingLabel: string | null;
  /** null = 카페인 정보 미확인. 절대 임의로 채우지 않는다. */
  caffeineMg: number | null;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl: string | null;
  sourceCheckedDate: string | null;
  note: string | null;
  /** 원본 자료 순서 = 추천순 */
  rank: number;
};

export type IntakeEntry = {
  id: string;
  drinkId: string | null;
  drinkSnapshot: {
    name: string;
    cafeName: string;
    size: string | null;
    caffeineMg: number;
  };
  /** ISO 8601 */
  intakeAt: string;
  createdAt: string;
  updatedAt: string;
};

/** 'YYYY-MM-DD' (dayStartHour 기준 하루) */
export type DayKey = string;

export type Settings = {
  onboardingDone: boolean;
  defaultBedtime: string;
  lastCampusId: CampusId | null;
  weightKg: number | null;
  notifications: {
    dailyReminder: boolean;
    bedtimeReminder: boolean;
  };
};

export type DailySummary = {
  day: DayKey;
  dailyCaffeineMg: number;
  firstCaffeineTime: string | null;
  lastCaffeineTime: string | null;
  plannedBedtime: string | null;
  estimatedCaffeineAtBedtime: number | null;
  drinkCount: number;
  caffeineConsumedWithin6HoursOfBedtime: boolean | null;
};
