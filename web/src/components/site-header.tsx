// Floating island header, structure from 21st.dev "Navbar 1" (preetsuthar17): a rounded, shadowed bar
// floating over the page. Its motion/react entrances are left out on purpose: the nav keeps the
// site's own sliding bar (components/indicator.js, spring easing) and hover hairline (motion.css).
import { useEffect, useRef } from 'react';
import { VIEWS } from '@legacy/config.js';
import { attachIndicator } from '@legacy/components/indicator.js';
import type { ServerStatus } from '@/hooks/use-server-status';
import { CopyAddress } from './copy-address';
import { Icon } from './icon';
import { StatusChip } from './status-chip';
import { ThemeToggle } from './theme-toggle';

const NAV = (VIEWS as Array<{ id: string; label: string }>).filter((v) => v.id !== 'admin');
const island = 'rounded-full bg-[var(--glass)] shadow-[var(--float)] backdrop-blur-xl';

export function SiteHeader({ view, status }: { view: string; status: ServerStatus }) {
  const listRef = useRef<HTMLUListElement>(null);
  const indicator = useRef<{ update: () => void } | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || indicator.current) return;
    // the bar follows the label, not the padded link, so it sits under the word inside the pill
    indicator.current = attachIndicator(list, () => list.querySelector('[aria-current="page"] .nav-label'), { class: 'indicator-or' });
  }, []);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); // keep the active tab visible on phones
    indicator.current?.update();
  }, [view]);

  return (
    <header className="sticky top-0 z-40 px-[var(--gutter)] pt-3">
      <div className="mx-auto grid max-w-[var(--page-max)] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2">
        <a className="brand group col-start-1 row-start-1 inline-flex items-center gap-2.5 justify-self-start rounded-full py-1 pr-3 font-display text-xl font-bold tracking-tight text-ink no-underline" href="#start" translate="no" aria-label="ARDET – zur Startseite">
          <img className="brand-mark size-9 rounded-[11px] shadow-[var(--hang)]" src="/favicon.png" alt="" width="36" height="36" />
          <span className="max-[440px]:sr-only">ARDET</span>
        </a>

        <nav aria-label="Hauptnavigation" className={`${island} col-span-2 row-start-2 min-w-0 max-w-full justify-self-stretch p-1 lg:justify-self-start`}>
          <div className="nav-scroll overflow-x-auto">
            <ul ref={listRef} className="nav-list m-0 flex list-none p-0">
              {NAV.map((v) => (
                <li key={v.id}>
                  <a className="nav-link" href={`#${v.id}`} data-nav={v.id} aria-current={v.id === view ? 'page' : undefined}><span className="nav-label">{v.label}</span></a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className={`${island} col-start-2 row-start-1 flex items-center gap-1 justify-self-end py-1 pl-4 pr-1`}>
          <StatusChip status={status} className="mr-2 max-[420px]:hidden" />
          <CopyAddress hideAddressBelow />
          <a className="btn btn-icon admin-link" href="#admin" aria-label="Admin-Bereich" title="Admin-Bereich"><Icon name="key" /></a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
