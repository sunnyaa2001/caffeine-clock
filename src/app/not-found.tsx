import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';

export default function NotFound() {
  return <EmptyState title="페이지를 찾을 수 없어요." body="주소가 바뀌었거나 없는 페이지예요." action={<ButtonLink href="/">오늘로 가기</ButtonLink>} />;
}
