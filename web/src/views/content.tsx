// Pages fed by /api/content: Neuigkeiten, Regeln and Staff, plus the static Beitreten page.
// The admin edits the same resource, so every page re-renders from one store.
import { useEffect, useRef } from 'react';
import { MESSAGES, newsTag } from '@legacy/config.js';
import { reveal } from '@legacy/components/reveal.js';
import { timeAgo } from '@legacy/lib/format.js';
import { CopyAddress } from '@/components/copy-address';
import { Icon } from '@/components/icon';
import { RichText } from '@/components/rich-text';
import { useStore } from '@/hooks/use-store';

export interface Post { id: string; title: string; body: string; tag: string; pinned: boolean; author: string; created: number; updated: number | null }
interface Content { rules: Array<{ id: string; text: string }>; staff: Array<{ id: string; role: string; tincture: string; names: string[] }>; news: Post[] }
interface ContentSnap { data: Content | null; error: string; loading: boolean }
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Resource = any;

const longDate = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeStyle: 'short' });

function useRevealOn<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => { if (ref.current) reveal(ref.current); }, [dep]);
  return ref;
}

/** Loading or error line; null once data is there. */
function stateText(snap: ContentSnap) {
  if (snap.data) return null;
  return { text: snap.loading || !snap.error ? MESSAGES.loading : snap.error, error: !snap.loading && Boolean(snap.error) };
}

export function NewsPost({ post }: { post: Post }) {
  const tag = newsTag(post.tag);
  const headingId = `post-${post.id}`;
  return (
    <article className={`post${post.pinned ? ' is-pinned' : ''}`} data-tincture={tag.tincture} data-reveal="unroll" aria-labelledby={headingId}>
      <div className="post-ribbon">
        <span className="post-tag">{tag.label}</span>
        {post.pinned && <span className="post-pin"><Icon name="pin" size={16} />Angepinnt</span>}
      </div>
      <h2 className="post-title" id={headingId}>{post.title}</h2>
      <p className="post-meta">
        <time dateTime={new Date(post.created).toISOString()} title={longDate.format(post.created)}>{timeAgo(post.created)}</time>
        {post.author ? ` · ${post.author}` : ''}{post.updated ? ' · bearbeitet' : ''}
      </p>
      <div className="post-body"><RichText text={post.body} /></div>
    </article>
  );
}

export function NewsView({ content }: { content: Resource }) {
  const snap = useStore<ContentSnap>(content);
  const news = snap.data?.news ?? [];
  const ref = useRevealOn<HTMLDivElement>(snap.data);
  const state = stateText(snap);
  return (
    <section className="view wrap view-page" id="view-neuigkeiten" aria-labelledby="neuigkeiten-title">
      <h1 id="neuigkeiten-title" className="view-title" tabIndex={-1}>Neuigkeiten</h1>
      <p className="view-lede">Updates, Events und Wartungen vom Team.</p>
      <div className="news-feed" ref={ref}>
        {state && <p className={`content-state${state.error ? ' is-error' : ''}`}>{state.text}</p>}
        {snap.data && news.length === 0 && <p className="content-state">{MESSAGES.newsEmpty}</p>}
        {news.map((p) => <NewsPost key={p.id} post={p} />)}
      </div>
    </section>
  );
}

export function RulesView({ content }: { content: Resource }) {
  const snap = useStore<ContentSnap>(content);
  const ref = useRevealOn<HTMLOListElement>(snap.data);
  const state = stateText(snap);
  const rules = snap.data?.rules ?? [];
  return (
    <section className="view wrap view-page" id="view-regeln" aria-labelledby="regeln-title">
      <h1 id="regeln-title" className="view-title" tabIndex={-1}>Regeln</h1>
      <ol className="rules" ref={ref}>
        {state && <li className={`is-empty content-state${state.error ? ' is-error' : ''}`}>{state.text}</li>}
        {snap.data && rules.length === 0 && <li className="is-empty">Noch keine Regeln eingetragen.</li>}
        {rules.map((r) => <li key={r.id} data-reveal="rise"><RichText text={r.text} inline /></li>)}
      </ol>
    </section>
  );
}

export function StaffView({ content }: { content: Resource }) {
  const snap = useStore<ContentSnap>(content);
  const ref = useRevealOn<HTMLDListElement>(snap.data);
  const state = stateText(snap);
  return (
    <section className="view wrap view-page" id="view-staff" aria-labelledby="staff-title">
      <h1 id="staff-title" className="view-title" tabIndex={-1}>Staff</h1>
      {state && <p className={`content-state${state.error ? ' is-error' : ''}`}>{state.text}</p>}
      <dl className="staff-roll" ref={ref}>
        {(snap.data?.staff ?? []).map((s) => (
          <div key={s.id} className="roll-row" data-tincture={s.tincture} data-reveal="unroll">
            <dt>{s.role}</dt>
            <dd>
              {s.names.length
                ? s.names.map((n) => <span key={n} className="name" translate="no">{n}</span>)
                : <span className="name is-empty">noch frei</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function JoinView() {
  return (
    <section className="view wrap view-page" id="view-beitreten" aria-labelledby="beitreten-title">
      <h1 id="beitreten-title" className="view-title" tabIndex={-1}>Wie man beitritt</h1>
      <p className="view-lede">Der Server ist whitelisted — bitte einen Admin, deinen Namen hinzuzufügen.</p>
      <div className="editions">
        <article className="edition" data-tincture="azure" data-reveal="unroll">
          <h2 className="edition-title">Java Edition</h2>
          <p>Füge die Adresse als Server in deiner Multiplayer-Liste hinzu.</p>
          <CopyAddress size="lg" className="justify-self-start max-[400px]:justify-self-stretch" />
        </article>
        <article className="edition" data-tincture="vert" data-reveal="unroll">
          <h2 className="edition-title">Bedrock Edition</h2>
          <p>Nutze einen GeyserMC-kompatiblen Client und verbinde dich mit der Adresse auf dem Port, den dir ein Admin gibt.</p>
          <CopyAddress size="lg" className="justify-self-start max-[400px]:justify-self-stretch" />
        </article>
      </div>
    </section>
  );
}
