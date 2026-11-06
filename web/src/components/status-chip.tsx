import type { ServerStatus } from '@/hooks/use-server-status';
import { cn } from '@/lib/utils';

/** Pip plus words, so the state never relies on colour alone. */
export function StatusChip({ status, className }: { status: ServerStatus; className?: string }) {
  return (
    <p data-state={status.state} aria-busy={status.state === 'loading'} className={cn('flex items-center gap-2 whitespace-nowrap text-sm', className)}>
      <span className="pip" aria-hidden="true" />
      <span className="visually-hidden">Serverstatus: </span>
      <b className="font-bold">{status.label}</b>
      <span className="text-ink-dim max-[600px]:hidden">
        <span aria-hidden="true">·</span> <span className="font-mono">{status.players}</span> Spieler
      </span>
    </p>
  );
}
