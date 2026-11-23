'use client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <EmptyState title={'정보를 불러오지 못했어요.\n잠시 후 다시 시도해주세요.'} action={<Button onClick={reset}>다시 시도</Button>} />;
}
