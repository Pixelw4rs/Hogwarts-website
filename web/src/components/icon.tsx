// The site's authored icon set (data/js/lib/icons.js), mounted into a span.
import { useEffect, useRef } from 'react';
import { icon } from '@legacy/lib/icons.js';

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { ref.current?.replaceChildren(icon(name, { size })); }, [name, size]);
  return <span ref={ref} aria-hidden="true" className="inline-flex" />;
}
