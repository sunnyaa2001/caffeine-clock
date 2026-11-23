'use client';
import { ChevronRight, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ScreenTitle } from '@/components/ui/PageHeader';
import { CAMPUSES } from '@/data/catalog';
import { actions, useAppData } from '@/data/store';

export function CampusPicker() {
  const router = useRouter();
  const data = useAppData();
  return (
    <div className="pt-5">
      <ScreenTitle title="어느 캠퍼스 근처인가요?" subtitle="가까운 카페의 음료를 보여드릴게요." />
      <ul className="space-y-3">
        {CAMPUSES.map((c, i) => (
          <li key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <button
              className="pressable block w-full text-left"
              onClick={() => {
                actions.setLastCampus(c.id);
                router.push(`/explore/${c.id}/`);
              }}
            >
              <Card className="flex items-center gap-4 px-5 py-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <MapPin size={22} strokeWidth={2.2} />
                </span>
                <span className="flex-1">
                  <span className="block text-[20px] font-bold">{c.name}</span>
                  <span className="mt-0.5 block text-sub text-ink-3">{c.area}</span>
                </span>
                {data?.settings.lastCampusId === c.id && <span className="rounded-full bg-fill px-2.5 py-1 text-caption font-semibold text-ink-2">최근</span>}
                <ChevronRight className="text-ink-3" size={22} />
              </Card>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
