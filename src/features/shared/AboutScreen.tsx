import { Accordion } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { BackBar, ScreenTitle } from '@/components/ui/PageHeader';
import { APP_CONFIG } from '@/config/app';

const TOPICS = [
  {
    q: '카페인의 반감기란?',
    a: '몸에 들어온 카페인이 절반으로 줄어드는 데 걸리는 시간이에요.',
    more: `건강한 성인은 평균 약 ${APP_CONFIG.halfLifeHours}시간으로 알려져 있어요. 예를 들어 200 mg을 마시면 ${APP_CONFIG.halfLifeHours}시간 뒤에 약 100 mg, 다시 ${APP_CONFIG.halfLifeHours}시간 뒤에 약 50 mg이 남는 식으로 줄어들어요.`,
  },
  {
    q: '왜 사람마다 다른가요?',
    a: '같은 양을 마셔도 줄어드는 속도는 사람마다 달라요.',
    more: '유전적 특성, 흡연, 임신, 복용 중인 약, 간 기능 등에 따라 반감기가 몇 시간씩 차이 날 수 있어요. 카페인에 대한 민감도도 사람마다 달라서 같은 양이라도 느끼는 정도가 달라요.',
  },
  {
    q: '이 앱은 어떻게 계산하나요?',
    a: '마신 음료마다 남은 양을 계산해서 모두 더해요.',
    more: `각 음료의 카페인 × 0.5^(지난 시간 ÷ ${APP_CONFIG.halfLifeHours}시간)으로 남은 양을 구하고 합칩니다. 예상범위는 반감기를 ${APP_CONFIG.halfLifeRange.fast}시간(빠른 대사)과 ${APP_CONFIG.halfLifeRange.slow}시간(느린 대사)으로 가정해 다시 계산한 값이에요. 체중이나 키는 계산에 쓰지 않아요.`,
  },
  {
    q: '왜 실제 혈중 농도와 다를 수 있나요?',
    a: '흡수 과정과 개인차를 단순화한 추정치이기 때문이에요.',
    more: '실제로는 카페인이 위장에서 흡수되는 데 시간이 걸리고, 음식과 함께 마셨는지, 개인의 대사 속도가 어떤지에 따라 달라져요. 이 앱은 마신 순간 전부 흡수된다고 단순하게 가정한 일반적인 모델이에요. 메뉴의 카페인 수치도 브랜드 공개 자료 기준이라 매장과 원두에 따라 달라질 수 있어요.',
  },
];

export function AboutScreen() {
  return (
    <>
      <BackBar fallback="/" />
      <ScreenTitle title="카페인에 대해" subtitle="짧게 알아두면 숫자가 더 잘 보여요." />
      <ul className="space-y-3">
        {TOPICS.map((t) => (
          <li key={t.q}>
            <Card className="px-5 pt-5 pb-3">
              <h2 className="text-headline font-bold">{t.q}</h2>
              <p className="mt-1.5 text-body text-ink-2">{t.a}</p>
              <Accordion title={<span className="text-sub text-accent">더 알아보기</span>} className="mt-2">
                {t.more}
              </Accordion>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="mt-6 bg-fill px-5 py-5 shadow-none">
        <h2 className="text-sub font-bold text-ink-2">안내</h2>
        <ul className="mt-2 space-y-1.5 text-sub text-ink-2">
          <li>{APP_CONFIG.name}은 교육 및 연구 목적으로 제공되는 정보 도구입니다.</li>
          <li>표시되는 카페인 잔존량은 일반적인 반감기를 기반으로 한 추정값이며 실제 혈중 카페인 농도와 다를 수 있습니다.</li>
          <li>카페인 대사속도와 수면에 미치는 영향은 개인마다 다릅니다.</li>
          <li>의료적 판단이나 진단을 제공하지 않습니다.</li>
        </ul>
      </Card>
      <p className="mt-4 px-1 text-caption text-ink-3">메뉴 카페인 수치: 각 브랜드 공식 영양정보 (2026.11.16 확인). 일부 메뉴는 공개 후기 참고 수치 또는 미확인으로 표시돼요.</p>
    </>
  );
}
