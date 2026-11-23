import { createRoot } from 'react-dom/client';
import { AppShell } from '@/features/shared/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { TodayScreen } from '@/features/today/TodayScreen';
import { CafeList } from '@/features/explore/CafeList';
import { MenuBrowser } from '@/features/explore/MenuBrowser';
import { DrinkDetail } from '@/features/drink/DrinkDetail';
import { HistoryScreen } from '@/features/history/HistoryScreen';
import { AboutScreen } from '@/features/shared/AboutScreen';
import { SettingsScreen } from '@/features/shared/SettingsScreen';
import { getCafe, getDrink } from '@/data/catalog';
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
    const [, cafeId, drinkId] = seg;
    if (!cafeId) return <CafeList />;
    if (getCafe(cafeId)) {
      if (!drinkId) return <MenuBrowser cafeId={cafeId} />;
      if (getDrink(drinkId)) return <DrinkDetail cafeId={cafeId} drinkId={drinkId} />;
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
