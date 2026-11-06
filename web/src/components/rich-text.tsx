// The admin text format (paragraphs + [label](href) links) rendered as React, same parser as before.
import { parseRich } from '@legacy/lib/richtext.js';

interface Segment { text: string; href?: string; external?: boolean }

function Seg({ s }: { s: Segment }) {
  if (!s.href) return <>{s.text}</>;
  return s.external
    ? <a href={s.href} target="_blank" rel="noopener">{s.text}<span className="visually-hidden"> (öffnet in neuem Tab)</span></a>
    : <a href={s.href}>{s.text}</a>;
}

export function RichText({ text, inline = false, limit }: { text: string; inline?: boolean; limit?: number }) {
  const paragraphs = (parseRich(text) as Segment[][]).slice(0, limit);
  if (inline) {
    return <span>{paragraphs.map((p, i) => <span key={i}>{i > 0 && <br />}{p.map((s, j) => <Seg key={j} s={s} />)}</span>)}</span>;
  }
  return <>{paragraphs.map((p, i) => <p key={i}>{p.map((s, j) => <Seg key={j} s={s} />)}</p>)}</>;
}
