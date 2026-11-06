// Night/day switch: the new cloth is lowered from the bar and the sun/moon turns over (theme-toggle.js).
import { bindThemeToggle } from '@legacy/components/theme-toggle.js';
import { useBindOnce } from '@/hooks/use-legacy';

export function ThemeToggle() {
  const ref = useBindOnce<HTMLButtonElement>(bindThemeToggle);
  return <button ref={ref} type="button" className="btn btn-icon theme-toggle" data-theme-toggle aria-label="Tagmodus einschalten" />;
}
