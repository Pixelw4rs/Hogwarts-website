// Views fed by /api/content: Neuigkeiten (feed + Start teaser), Regeln and Staff.
// The admin edits the same data in the Admin-Bereich; every view re-renders from one resource.
import { START_NEWS_LIMIT, MESSAGES, newsTag } from '../config.js';
import { reveal } from '../components/reveal.js';
import { richText } from '../components/rich-text.js';
import { $, el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { timeAgo } from '../lib/format.js';

const longDate = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeStyle: 'short' });

/** @typedef {{ id: string, title: string, body: string, tag: string, pinned: boolean, author: string, created: number, updated: number|null }} Post */
/** @typedef {{ rev: number, rules: Array<{ id: string, text: string }>, staff: Array<{ id: string, role: string, tincture: string, names: string[] }>, news: Post[] }} Content */

/** @param {Post} post @param {{ teaser?: boolean }} [opts] */
export function newsPost(post, { teaser = false } = {}) {
  const tag = newsTag(post.tag);
  const headingId = `post-${post.id}${teaser ? '-t' : ''}`;
  const when = el('time', { datetime: new Date(post.created).toISOString(), title: longDate.format(post.created), text: timeAgo(post.created) });
  const body = richText(post.body);
  return el('article', { class: `post${teaser ? ' is-teaser' : ''}${post.pinned ? ' is-pinned' : ''}`, dataset: { tincture: tag.tincture }, 'data-reveal': 'unroll', 'aria-labelledby': headingId },
    el('div', { class: 'post-ribbon' },
      el('span', { class: 'post-tag', text: tag.label }),
      post.pinned ? el('span', { class: 'post-pin' }, icon('pin', { size: 16 }), 'Angepinnt') : null,
    ),
    el(teaser ? 'h3' : 'h2', { class: 'post-title', id: headingId, text: post.title }),
    el('p', { class: 'post-meta' }, when, post.author ? ` · ${post.author}` : '', post.updated ? ' · bearbeitet' : ''),
    teaser
      ? el('div', { class: 'post-body is-clamped' }, ...body.slice(0, 1))
      : el('div', { class: 'post-body' }, ...body),
  );
}

/** Loading / error / empty line; inside a list it has to be a list item. */
const stateLine = (text, kind = 'empty', host = null) =>
  el(host?.tagName === 'OL' ? 'li' : host?.tagName === 'DL' ? 'div' : 'p', { class: `content-state is-${kind}`, text });

/** @param {ReturnType<typeof import('../lib/resource.js').createResource>} content */
export function mountContentViews(content) {
  const feed = $('#news-feed');
  const teaser = $('#start-news');
  const teaserSection = $('#start-news-section');
  const rules = $('#rules-list');
  const roll = $('#staff-roll');

  content.subscribe((snap) => {
    /** @type {Content|null} */
    const c = snap.data;
    if (!c) {
      const text = snap.loading ? MESSAGES.loading : snap.error;
      for (const node of [feed, rules, roll]) node.replaceChildren(stateLine(text, snap.loading ? 'loading' : 'error', node));
      teaserSection.hidden = true;
      return;
    }

    feed.replaceChildren(...(c.news.length ? c.news.map((p) => newsPost(p)) : [stateLine(MESSAGES.newsEmpty)]));
    const latest = c.news.slice(0, START_NEWS_LIMIT);
    teaserSection.hidden = latest.length === 0;
    teaser.replaceChildren(...latest.map((p) => newsPost(p, { teaser: true })));

    rules.replaceChildren(...(c.rules.length
      ? c.rules.map((r) => el('li', { 'data-reveal': 'rise' }, ...richText(r.text, { inline: true })))
      : [el('li', { class: 'is-empty' }, 'Noch keine Regeln eingetragen.')]));

    roll.replaceChildren(...c.staff.map((s) => el('div', { class: 'roll-row', dataset: { tincture: s.tincture }, 'data-reveal': 'unroll' },
      el('dt', { text: s.role }),
      el('dd', {}, ...(s.names.length ? s.names.map((n) => el('span', { class: 'name', translate: 'no', text: n })) : [el('span', { class: 'name is-empty', text: 'noch frei' })])),
    )));

    reveal(feed); reveal(teaser); reveal(rules); reveal(roll);
  });
}
