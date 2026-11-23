'use client';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { actions } from '@/data/store';
import type { IntakeEntry } from '@/data/types';
import { hm } from '@/lib/time';
import { IntakeTimeSheet } from '@/features/shared/IntakeTimeSheet';

export function IntakeTimeline({ entries }: { entries: IntakeEntry[] }) {
  const [editing, setEditing] = useState<IntakeEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();
  const close = () => {
    setEditing(null);
    setConfirmDelete(false);
  };

  return (
    <Card className="px-5 py-3">
      <ol>
        {entries.map((e, i) => (
          <li key={e.id} className="relative">
            {i < entries.length - 1 && <span aria-hidden className="absolute top-9 bottom-[-12px] left-[51px] w-0.5 rounded-full bg-fill-2" />}
            <button onClick={() => setEditing(e)} className="pressable flex min-h-[64px] w-full items-center gap-3 py-2 text-left" aria-label={`${hm(e.intakeAt)} ${e.drinkSnapshot.name} 수정 또는 삭제`}>
              <span className="num w-11 shrink-0 text-sub font-semibold text-ink-2">{hm(e.intakeAt)}</span>
              <span aria-hidden className="relative z-10 size-3 shrink-0 rounded-full border-[3px] border-accent bg-surface" />
              <span className="min-w-0 flex-1 pl-1">
                <span className="block truncate text-body font-semibold">{e.drinkSnapshot.name}</span>
                <span className="block truncate text-caption text-ink-3">{e.drinkSnapshot.cafeName}</span>
              </span>
              <span className="num shrink-0 text-body font-bold">{Math.round(e.drinkSnapshot.caffeineMg)} mg</span>
              <ChevronRight size={18} className="shrink-0 text-ink-3" />
            </button>
          </li>
        ))}
      </ol>

      <IntakeTimeSheet
        open={!!editing}
        onClose={close}
        initial={editing ? new Date(editing.intakeAt) : undefined}
        title="마신 시간 수정"
        submitLabel="저장"
        subtitle={editing && `${editing.drinkSnapshot.name} · ${Math.round(editing.drinkSnapshot.caffeineMg)} mg`}
        onSubmit={(at) => {
          if (editing) actions.updateEntryTime(editing.id, at.toISOString());
          toast('시간을 바꿨어요');
          close();
        }}
        extra={
          <Button
            variant="ghost"
            className={confirmDelete ? 'text-ink' : 'text-ink-2'}
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true);
              if (editing) actions.deleteEntry(editing.id);
              toast('기록을 삭제했어요');
              close();
            }}
          >
            {confirmDelete ? '한 번 더 누르면 삭제돼요' : '이 기록 삭제'}
          </Button>
        }
      />
    </Card>
  );
}
