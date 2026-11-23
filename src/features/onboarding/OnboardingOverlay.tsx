'use client';
import { Clock3, Hourglass, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { APP_CONFIG } from '@/config/app';
import { actions, useAppData } from '@/data/store';

const PAGES = [
  { icon: Hourglass, text: '카페인은 마신 뒤에도\n몇 시간 동안 몸에 남아 있어요.' },
  { icon: Clock3, text: '마신 음료와 시간을 기록하면\n취침시간의 예상 잔존량을\n확인할 수 있어요.' },
  { icon: Info, text: '숫자는 개인의 실제 혈중 농도가 아닌\n일반적인 반감기를 이용한\n추정치예요.' },
];

export function OnboardingOverlay() {
  const data = useAppData();
  const [page, setPage] = useState(0);
  const [leaving, setLeaving] = useState(false);
  if (!data || data.settings.onboardingDone) return null;

  const finish = () => {
    setLeaving(true);
    setTimeout(() => actions.updateSettings({ onboardingDone: true }), 220);
  };
  const last = page === PAGES.length - 1;
  const { icon: Icon, text } = PAGES[page];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${APP_CONFIG.name} 소개`}
      className={cn('fixed inset-0 z-[70] bg-bg transition-opacity duration-200', leaving ? 'opacity-0' : 'animate-fade-in')}
    >
      <div className="mx-auto flex h-full max-w-[480px] flex-col px-6 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),24px)]">
        <div className="flex h-12 items-center justify-between">
          <span className="text-sub font-bold text-ink-2">{APP_CONFIG.name}</span>
          {!last && (
            <button onClick={finish} className="pressable h-11 px-3 text-sub font-semibold text-ink-3">
              건너뛰기
            </button>
          )}
        </div>

        <div key={page} className="flex flex-1 flex-col justify-center animate-fade-up">
          <div className="mb-8 grid size-20 place-items-center rounded-[28px] bg-accent-soft text-accent">
            <Icon size={36} strokeWidth={2} />
          </div>
          <p className="text-[26px] leading-[1.4] font-bold tracking-tight whitespace-pre-line">{text}</p>
          {last && (
            <p className="mt-6 text-sub text-ink-2">
              {APP_CONFIG.name}은 교육 및 연구 목적으로 제공되는 정보 도구예요. 카페인 대사속도와 수면에 미치는 영향은
              사람마다 다르며, 의료적 판단이나 진단을 제공하지 않아요.
            </p>
          )}
        </div>

        <div className="mb-6 flex justify-center gap-2" aria-label={`${PAGES.length}페이지 중 ${page + 1}페이지`}>
          {PAGES.map((_, i) => (
            <span key={i} className={cn('h-2 rounded-full transition-all duration-300', i === page ? 'w-6 bg-accent' : 'w-2 bg-fill-2')} />
          ))}
        </div>
        <Button onClick={() => (last ? finish() : setPage((p) => p + 1))}>{last ? '시작하기' : '다음'}</Button>
      </div>
    </div>
  );
}
