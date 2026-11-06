// Rolling counter: the number rolls up when it grows and down when it shrinks (components/roll-number.js).
import { useEffect, useRef } from 'react';
import { rollNumber } from '@legacy/components/roll-number.js';

export function Roll({ value, className }: { value: number | string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { if (ref.current) rollNumber(ref.current, value); }, [value]);
  return <span ref={ref} className={className} />;
}
