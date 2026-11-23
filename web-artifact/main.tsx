import { createRoot } from 'react-dom/client';
import { AppShell } from '@/features/shared/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { TodayScreen } from '@/features/today/TodayScreen';
import { CampusPicker } from '@/features/explore/CampusPicker';
import { CafeList } from '@/features/explore/CafeList';
import { MenuBrowser } from '@/features/explore/MenuBrowser';
import { DrinkDetail } from '@/features/drink/DrinkDetail';
import { HistoryScreen } from '@/features/history/HistoryScreen';
import { AboutScreen } from '@/features/shared/AboutScreen';
import { SettingsScreen } from '@/features/shared/SettingsScreen';
import { getCafe, getCampus, getDrink } from '@/data/catalog';
import type { CampusId } from '@/data/types';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { usePath } from './router';

function Screen({ path }: { path: string }) {
  const seg = path.split('/').filter(Boolean);
  if (seg.length === 0) return <HomeScreen />;
  if (seg[0] === 'today') return <TodayScreen />;
  if (seg[0] === 'history') return <HistoryScreen />;
  if (seg[0] === 'about') return <AboutScreen />;
  if (seg[0] === 'settings') return <SettingsScreen />;
  if (seg[0] === 'explore') {
    const [, campusId, cafeId, drinkId] = seg;
    if (!campusId) return <CampusPicker />;
    if (getCampus(campusId)) {
      const c = campusId as CampusId;
      if (!cafeId) return <CafeList campusId={c} />;
      if (getCafe(cafeId)) {
        if (!drinkId) return <MenuBrowser campusId={c} cafeId={cafeId} />;
        if (getDrink(drinkId)) return <DrinkDetail campusId={c} cafeId={cafeId} drinkId={drinkId} />;
      }
    }
  }
  return <EmptyState title="페이지를 찾을 수 없어요." action={<ButtonLink href="/">오늘로 가기</ButtonLink>} />;
}

function App() {
  const path = usePath();
  return (
    <AppShell>
      <div key={path} className="animate-fade-up">
        <Screen path={path} />
      </div>
    </AppShell>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
