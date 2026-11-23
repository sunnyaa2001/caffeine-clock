'use client';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card, SectionTitle } from '@/components/ui/Card';
import { BackBar, ScreenTitle } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/States';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/components/ui/Toast';
import { actions, useAppData } from '@/data/store';
import { useSync } from '@/data/remote';
import { isRemoteMode } from '@/config/backend';
import { buildDemo } from '@/lib/demo';
import { dailySummaryCsv, download, entriesCsv } from '@/lib/export';
import { ymd } from '@/lib/time';

export function SettingsScreen() {
  const data = useAppData();
  const toast = useToast();
  const [weight, setWeight] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'reset' | 'demo' | 'logout' | null>(null);
  const sync = useSync();
  const remote = isRemoteMode();
  if (!data) return <Skeleton className="mt-16 h-96" />;
  const s = data.settings;
  const weightValue = weight ?? (s.weightKg ? String(s.weightKg) : '');

  const saveWeight = () => {
    const n = Number(weightValue);
    const v = weightValue.trim() === '' ? null : n >= 25 && n <= 250 ? Math.round(n * 10) / 10 : s.weightKg;
    actions.updateSettings({ weightKg: v });
    setWeight(null);
  };
  const twoStep = (kind: 'reset' | 'demo' | 'logout', run: () => void) => {
    if (confirm !== kind) return setConfirm(kind);
    run();
    setConfirm(null);
  };

  return (
    <>
      <BackBar fallback="/" />
      <ScreenTitle title="설정" />

      {remote && sync?.code && (
        <>
          <SectionTitle>연구 참여</SectionTitle>
          <Card className="divide-y divide-line px-5">
            <Row title="입장코드" desc={sync.pending === 0 ? '모든 기록이 서버에 저장됐어요.' : sync.offline ? `인터넷이 연결되면 기록 ${sync.pending}개를 이어서 보낼게요.` : `기록 ${sync.pending}개를 보내는 중이에요.`}>
              <span className="num text-body font-bold tracking-wider">{sync.code}</span>
            </Row>
            <ActionRow
              title={confirm === 'logout' ? '한 번 더 누르면 이 기기에서 나가요' : '이 기기에서 나가기'}
              desc={sync.pending > 0 ? '아직 보내지 못한 기록이 있어요. 인터넷 연결 후 나가주세요.' : '기록은 서버에 남아 있어요. 같은 코드로 다시 들어올 수 있어요.'}
              onClick={() => sync.pending === 0 && twoStep('logout', () => actions.logout())}
            />
          </Card>
        </>
      )}

      <SectionTitle>추가 정보</SectionTitle>
      <Card className="px-5 py-4">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-body font-semibold">체중 (선택)</span>
            <span className="mt-0.5 block text-caption text-ink-3">mg/kg 보조 정보에만 쓰고, 계산에는 쓰지 않아요.</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-fill px-3">
            <input
              inputMode="decimal"
              value={weightValue}
              placeholder="-"
              onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ''))}
              onBlur={saveWeight}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="num h-11 w-14 bg-transparent text-right text-body font-semibold outline-none"
              aria-label="체중 kg"
            />
            <span className="shrink-0 text-sub text-ink-3">kg</span>
          </span>
        </label>
      </Card>

      <SectionTitle>카페인 기록 알림</SectionTitle>
      <Card className="divide-y divide-line px-5">
        <Row title="기록 알림" desc="“오늘 음료를 기록하지 않았어요.”">
          <Toggle label="기록 알림" checked={s.notifications.dailyReminder} onChange={(v) => actions.updateSettings({ notifications: { ...s.notifications, dailyReminder: v } })} />
        </Row>
        <Row title="취침 알림" desc="“취침 예정시간이 가까워지고 있어요.”">
          <Toggle label="취침 알림" checked={s.notifications.bedtimeReminder} onChange={(v) => actions.updateSettings({ notifications: { ...s.notifications, bedtimeReminder: v } })} />
        </Row>
      </Card>
      <p className="mt-2 px-1 text-caption text-ink-3">알림 발송은 준비 중이에요. 지금은 설정만 저장돼요.</p>

      <SectionTitle>내 데이터</SectionTitle>
      <Card className="divide-y divide-line px-5">
        <ActionRow
          title="일별 요약 내보내기 (CSV)"
          desc="연구 참여 시 제출용. 기기 밖으로 자동 전송되지 않아요."
          onClick={() => download(`caffeine-daily-${ymd(new Date())}.csv`, dailySummaryCsv(data.entries, data.bedtimes))}
        />
        <ActionRow title="섭취 기록 내보내기 (CSV)" onClick={() => download(`caffeine-entries-${ymd(new Date())}.csv`, entriesCsv(data.entries))} />
        <ActionRow title="소개 화면 다시 보기" onClick={() => actions.updateSettings({ onboardingDone: false })} />
        {!remote && (<>
        <ActionRow
          title={confirm === 'demo' ? '한 번 더 누르면 지금 기록이 예시로 바뀌어요' : '예시 기록 채우기 (발표·테스트용)'}
          desc="지난 13일의 예시 기록을 넣어요. 음료와 카페인 값은 실제 메뉴 데이터예요."
          onClick={() =>
            twoStep('demo', () => {
              actions.replaceAll(buildDemo());
              toast('예시 기록을 채웠어요');
            })
          }
        />
        <ActionRow
          title={confirm === 'reset' ? '한 번 더 누르면 모든 기록이 지워져요' : '모든 기록 지우기'}
          onClick={() =>
            twoStep('reset', () => {
              actions.resetAll();
              toast('모든 기록을 지웠어요');
            })
          }
        />
        </>)}
      </Card>
      <p className="mt-6 px-1 text-caption text-ink-3">
        {remote ? '기록은 입장코드로 연구팀 서버에 저장돼요. 이름 같은 개인정보는 저장하지 않아요.' : '모든 기록은 이 기기의 브라우저에만 저장돼요.'}
      </p>
    </>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-body font-semibold">{title}</span>
        {desc && <span className="mt-0.5 block text-caption text-ink-3">{desc}</span>}
      </span>
      {children}
    </div>
  );
}
function ActionRow({ title, desc, onClick }: { title: string; desc?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="pressable flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left">
      <span>
        <span className="block text-body font-semibold">{title}</span>
        {desc && <span className="mt-0.5 block text-caption text-ink-3">{desc}</span>}
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-3" />
    </button>
  );
}
