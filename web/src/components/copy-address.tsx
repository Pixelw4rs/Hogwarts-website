// The server address joined to its copy button. Copy states, the drawn check and the gold ring that
// settles on success all come from components/copy-button.js and motion.css, unchanged.
import { useCallback } from 'react';
import { SERVER_ADDRESS } from '@legacy/config.js';
import { bindCopyButton } from '@legacy/components/copy-button.js';
import { useBindOnce } from '@/hooks/use-legacy';
import { cn } from '@/lib/utils';

export function CopyAddress({ size = 'md', hideAddressBelow, className }: { size?: 'md' | 'lg'; hideAddressBelow?: boolean; className?: string }) {
  const bind = useCallback((btn: HTMLButtonElement) => {
    bindCopyButton(btn, SERVER_ADDRESS, { announceAs: `Server-Adresse ${SERVER_ADDRESS} kopiert` });
  }, []);
  const ref = useBindOnce<HTMLButtonElement>(bind);
  return (
    <div className={cn('ip-group inline-flex items-center gap-1 rounded-full bg-sunk p-1 ring-1 ring-line', className)}>
      <code
        translate="no"
        className={cn(
          'px-3 font-mono font-semibold text-link',
          size === 'lg' ? 'text-lg' : 'text-[0.9375rem]',
          hideAddressBelow && 'max-[600px]:hidden',
        )}
      >
        {SERVER_ADDRESS}
      </code>
      <button ref={ref} type="button" data-copy-address className={cn('btn btn-or', size === 'md' && 'min-h-9 px-4')}>
        <span data-label>IP kopieren</span>
      </button>
    </div>
  );
}
