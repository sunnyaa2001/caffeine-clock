import type { Metadata, Viewport } from 'next';
import { APP_CONFIG } from '@/config/app';
import { AppShell } from '@/features/shared/AppShell';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: '마신 음료와 시각, 취침 예정시간으로 잠들 때 남아 있을 카페인을 추정해 보여주는 교육·연구용 도구',
  appleWebApp: { capable: true, title: APP_CONFIG.name, statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f5f4f0',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
