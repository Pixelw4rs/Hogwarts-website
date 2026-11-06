// Start: castle hero, the board widgets hanging from the gilt rail, the latest hub entries, news, ways onward.
import { useEffect, useRef } from 'react';
import { BOARDS, DISCORD_URL, RECENT_LIMIT, START_NEWS_LIMIT, boardByKey, newsTag } from '@legacy/config.js';
import { reveal } from '@legacy/components/reveal.js';
import { countItems, recentItems, timeAgo } from '@legacy/lib/format.js';
import { parseRich } from '@legacy/lib/richtext.js';
import { toHash } from '@legacy/lib/route.js';
import castle from '@assets/hogwarts-bg.jpg';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Roll } from '@/components/roll';
import { useStore } from '@/hooks/use-store';
import type { ServerStatus } from '@/hooks/use-server-status';
import { cn } from '@/lib/utils';

interface Board { key: string; label: string; shortLabel?: string; tincture: string; coordinates?: boolean }
interface Item { id: string; title: string; meta: string; done: boolean; created: number; board: string }
interface Post { id: string; title: string; body: string; tag: string; pinned: boolean; author: string; created: number }

/* eslint-disable @typescript-eslint/no-explicit-any */
type HubStore = any;
type Resource = any;

function useReveal<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => { if (ref.current) reveal(ref.current); }, [dep]);
  return ref;
}

function BoardWidget({ board, items, loading }: { board: Board; items: Item[]; loading: boolean }) {
  const { open, done, total } = countItems(items);
  const n = board.coordinates ? total : open;
  const unit = board.coordinates ? (total === 1 ? 'Ort' : 'Orte') : `offen · ${done} erledigt`;
  const latest = items[0]?.title;
  return (
    <li data-reveal="unfurl" className="flex">
      <a
        className="pennant"
        href={toHash({ view: 'hub', board: board.key })}
        data-tincture={board.tincture}
        data-loading={loading ? '' : undefined}
        aria-label={loading ? `${board.label}: Board öffnen` : `${board.label}: ${n} ${unit}. Board öffnen`}
      >
        <Roll value={loading ? '–' : n} className="pennant-count font-display text-[clamp(2.5rem,1.9rem+2vw,3.75rem)] font-bold leading-none tracking-tight" />
        <span className="mt-1 text-[0.8125rem] opacity-85">{loading ? (board.coordinates ? 'Orte' : 'offen') : unit}</span>
        <span className="mt-auto pt-6 font-display text-lg font-bold leading-tight tracking-tight [hyphens:manual]">{board.shortLabel ?? board.label}</span>
        <span className="mt-1.5 line-clamp-2 text-[0.8125rem] opacity-85">{loading ? ' ' : latest ? `Zuletzt: ${latest}` : 'Noch leer'}</span>
      </a>
    </li>
  );
}

function RichParagraph({ text }: { text: string }) {
  const [first = []] = parseRich(text) as Array<Array<{ text: string; href?: string; external?: boolean }>>;
  return (
    <p className="line-clamp-3 text-ink-dim">
      {first.map((s, i) => (s.href
        ? <a key={i} href={s.href} {...(s.external ? { target: '_blank', rel: 'noopener' } : {})}>{s.text}</a>
        : <span key={i}>{s.text}</span>))}
    </p>
  );
}

export function StartView({ store, content, status }: { store: HubStore; content: Resource; status: ServerStatus }) {
  const snap = useStore<{ rev: number; error: string }>(store);
  const contentSnap = useStore<{ data: { news: Post[] } | null }>(content);
  const loading = snap.rev < 0;
  const visible: Record<string, Item[]> = Object.fromEntries((BOARDS as Board[]).map((b) => [b.key, store.visibleItems(b.key)]));
  const recent: Item[] = loading ? [] : recentItems(visible, RECENT_LIMIT);
  const news: Post[] = contentSnap.data?.news.slice(0, START_NEWS_LIMIT) ?? [];

  const railRef = useReveal<HTMLUListElement>(0);
  const recentRef = useReveal<HTMLOListElement>(`${snap.rev}/${recent.length}`);
  const newsRef = useReveal<HTMLDivElement>(news.length);
  const waysRef = useReveal<HTMLUListElement>(0);

  return (
    <section className="view pb-16" id="view-start" aria-labelledby="start-title">
      <div className="px-[var(--gutter)] pt-4">
        <div className="castle relative mx-auto flex h-[clamp(380px,62vh,600px)] max-w-[calc(var(--page-max)+48px)] items-end overflow-hidden rounded-lg bg-sunk">
          <img className="castle-img" src={castle} alt="" width={1280} height={720} fetchPriority="high" />
          <div className="absolute inset-0 bg-[image:var(--scrim)]" aria-hidden="true" />
          <div className="castle-inner relative w-full p-[clamp(20px,4vw,48px)] text-[var(--hero-ink)]">
            <h1 id="start-title" className="hero-title" tabIndex={-1}>Willkommen bei Hogwarts</h1>
            <p
              className="status-line mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-[rgb(16_26_26/0.6)] px-4 py-2 text-[0.9375rem] backdrop-blur-md"
              data-state={status.state}
              aria-busy={status.state === 'loading'}
            >
              <span className="pip" aria-hidden="true" />
              <span className="visually-hidden">Serverstatus: </span><b>{status.label}</b>
              <span className="opacity-50" aria-hidden="true">·</span>
              <span>Spieler online: <b className="font-mono">{status.players}</b></span>
              <span className="opacity-50" aria-hidden="true">·</span>
              <span>Version: <b className="font-mono">{status.version}</b></span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-[var(--page-max)] gap-x-10 gap-y-12 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <section aria-labelledby="rail-title">
          <h2 id="rail-title" className="text-[1.75rem]">Die Boards</h2>
          <p id="rail-hint" className="mt-1 text-[0.9375rem] text-ink-dim">Wähle ein Board, um im Community Hub weiterzubauen.</p>
          <ul ref={railRef} className="rail relative m-0 mt-6 grid list-none grid-cols-1 gap-3 p-0 pt-3 sm:grid-cols-3 md:grid-cols-5" aria-describedby="rail-hint">
            {(BOARDS as Board[]).map((b) => <BoardWidget key={b.key} board={b} items={visible[b.key] ?? []} loading={loading} />)}
          </ul>
        </section>

        <Card className="self-start">
          <CardHeader>
            <h2 id="recent-title" className="text-xl">Zuletzt im Hub</h2>
            <a href="#hub" className="text-sm font-bold no-underline hover:underline">Zum Hub</a>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-3">
            <ol ref={recentRef} className="m-0 list-none p-0" aria-labelledby="recent-title">
              {loading && <li className="px-3 py-3 text-ink-dim">{snap.error || 'Wird geladen…'}</li>}
              {!loading && recent.length === 0 && <li className="px-3 py-3 text-ink-dim">Noch keine Einträge — fang im Community Hub an.</li>}
              {recent.map((item) => {
                const board = boardByKey(item.board) as Board;
                const sub = [board.shortLabel ?? board.label, item.meta, timeAgo(item.created)].filter(Boolean).join(' · ');
                return (
                  <li key={`${item.board}/${item.id}`} data-reveal="rise">
                    <a href={toHash({ view: 'hub', board: item.board })} data-tincture={board.tincture} className="grid grid-cols-[12px_minmax(0,1fr)] items-baseline gap-x-3 rounded-sm px-3 py-2.5 text-ink no-underline transition-colors duration-150 hover:bg-surface-2">
                      <span className="size-2.5 translate-y-[-1px] rounded-full bg-[var(--tincture)] ring-1 ring-line-strong" aria-hidden="true" />
                      <span className={cn('truncate font-bold', item.done && 'text-ink-dim line-through')}>{item.title}</span>
                      <span className="col-start-2 truncate text-[0.8125rem] text-ink-dim">{sub}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      {news.length > 0 && (
        <section className="mx-auto mt-16 max-w-[var(--page-max)] px-[var(--gutter)]" aria-labelledby="start-news-title">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="start-news-title" className="text-[1.75rem]">Neuigkeiten</h2>
            <a href="#neuigkeiten" className="text-sm font-bold">Alle Neuigkeiten</a>
          </div>
          <div ref={newsRef} className="mt-6 grid gap-4 md:grid-cols-2">
            {news.map((p) => {
              const tag = newsTag(p.tag);
              return (
                <Card key={p.id} data-reveal="unroll" className="gap-3 p-6" aria-labelledby={`post-${p.id}-t`}>
                  <span data-tincture={tag.tincture} className="self-start rounded-full bg-[var(--tincture)] px-3 py-1 text-xs font-bold text-on-tincture">{tag.label}</span>
                  <h3 id={`post-${p.id}-t`} className="text-xl">{p.title}</h3>
                  <p className="text-sm text-ink-dim"><time dateTime={new Date(p.created).toISOString()}>{timeAgo(p.created)}</time>{p.author ? ` · ${p.author}` : ''}</p>
                  <RichParagraph text={p.body} />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <div className="mx-auto mt-16 max-w-[var(--page-max)] px-[var(--gutter)]">
        <ul ref={waysRef} className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
          {[
            { href: '#map', name: 'Sternkarte', text: 'Alle gemeinsamen Koordinaten als Sternkarte rund um den Spawn, dazu die Live-Karte der Welt.' },
            { href: DISCORD_URL, name: 'Discord beitreten', text: 'Immer noch da für Voice und schnellen Chat.', external: true },
            { href: '#wuensche', name: 'Plugin wünschen', text: 'Schlag ein Plugin oder Datapack vor und stimme für die Ideen der anderen.' },
          ].map((w) => (
            <li key={w.name} data-reveal="rise">
              <Card className="h-full p-6 transition-colors duration-150 hover:border-line-strong">
                <a className="way" href={w.href} {...(w.external ? { target: '_blank', rel: 'noopener' } : {})}>
                  <span className="way-name">{w.name}{w.external && <span className="visually-hidden"> (öffnet in neuem Tab)</span>}</span>
                  <span className="text-[0.9375rem] text-ink-dim">{w.text}</span>
                </a>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
