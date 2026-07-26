import type { ReactNode } from 'react';
import { Icon } from '@/components/ui';

export function EmptyState({ icon = 'Inbox', title, body, action }: { icon?: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-white/8 bg-white/[0.03]">
        <Icon name={icon} className="size-6 text-slate-500" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-slate-200">{title}</p>
        {body && <p className="mt-1 max-w-xs text-xs text-slate-500">{body}</p>}
      </div>
      {action}
    </div>
  );
}
