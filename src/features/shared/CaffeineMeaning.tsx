'use client';
import { Accordion } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { cn } from '@/components/ui/cn';
import { DAILY_REFERENCE_MG, interpret } from '@/lib/interpret';

/** 홈 Hero 안에 들어가는 한 줄 해석 */
export function MeaningLine({ mg }: { mg: number }) {
  const m = interpret(mg);
  return (
    <div className="mt-3 rounded-2xl bg-accent-mist px-4 py-3">
      <p className="text-sub font-semibold text-ink">{m.headline}</p>
      {m.comparison && <p className="mt-0.5 text-caption text-ink-2">{m.comparison}과 비슷한 양이에요.</p>}
    </div>
  );
}

/** 결과 화면의 "이 정도 양이면" 카드 */
export function MeaningCard({ mg, dailyTotal }: { mg: number; dailyTotal: number }) {
  const m = interpret(mg);
  const pct = Math.min(100, (dailyTotal / DAILY_REFERENCE_MG) * 100);
  return (
    <Card className="px-5 pt-5 pb-3">
      <p className="text-caption font-semibold text-accent">이 정도 양이면</p>
      <p className="mt-1.5 text-headline font-bold">{m.headline}</p>
      {m.comparison && <p className="mt-1 text-sub text-ink-2">{m.comparison}과 비슷한 양이에요.</p>}

      {m.effects.length > 0 && (
        <ul className="mt-4 space-y-2">
          {m.effects.map((e) => (
            <li key={e} className="flex gap-2.5 text-sub text-ink-2">
              <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
              {e}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 rounded-2xl bg-fill px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-3 text-sub">
          <span className="text-ink-2">오늘 총 섭취</span>
          <span className="num font-bold">
            {Math.round(dailyTotal)} <span className="font-medium text-ink-3">/ {DAILY_REFERENCE_MG} mg</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fill-2" aria-hidden>
          <div className={cn('h-full rounded-full bg-accent')} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-caption text-ink-3">400 mg은 식약처가 제시한 성인 하루 최대 섭취 권고량이에요.</p>
      </div>

      <Accordion title={<span className="text-sub text-ink-2">이 설명은 어떻게 정했나요?</span>} className="mt-2">
        <p>
          잠들 때 남은 카페인에 대한 공식적인 &lsquo;정상 범위&rsquo;는 없어요. 유럽식품안전청(EFSA)은 잠들기 전 약 100 mg의 카페인이 일부 성인에게서
          잠드는 시간을 늘리고 수면 시간을 줄일 수 있다고 봤어요. 이 앱은 이 내용을 바탕으로 50 mg, 100 mg, 200 mg을 기준으로 설명을 나눴어요.
        </p>
        <p className="mt-2">
          카페인에 대한 민감도는 사람마다 크게 달라서, 같은 양이라도 아무렇지 않은 사람도 있고 더 크게 느끼는 사람도 있어요. 의료적 판단이 아닌 참고 정보예요.
        </p>
        <p className="mt-2">
          <a className="text-accent underline underline-offset-2" href="https://www.efsa.europa.eu/en/efsajournal/pub/4102" target="_blank" rel="noreferrer">
            EFSA, Scientific Opinion on the safety of caffeine (2015)
          </a>
        </p>
      </Accordion>
    </Card>
  );
}
