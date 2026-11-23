'use client';
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { ToastProvider } from '@/components/ui/Toast';
import { OnboardingOverlay } from '@/features/onboarding/OnboardingOverlay';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="mx-auto min-h-dvh max-w-[480px] px-5 pt-[env(safe-area-inset-top)] pb-[calc(96px+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <BottomNav />
      <OnboardingOverlay />
    </ToastProvider>
  );
}
