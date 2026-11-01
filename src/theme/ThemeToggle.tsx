import { useTheme } from './ThemeContext';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
  /** 'switch' = the sliding pill (default). 'icon' = a compact round icon button, used in the navbar. */
  variant?: 'switch' | 'icon';
}

function SunIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

function MoonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none">
      <path d="M20.5 14.6c-1.2.5-2.4.8-3.7.8-5.2 0-9.4-4.2-9.4-9.4 0-1.3.3-2.6.8-3.7-3.9 1.3-6.7 5-6.7 9.3 0 5.5 4.4 9.9 9.9 9.9 4.3 0 8-2.8 9.3-6.7-.1-.1-.2-.2-.2-.2Z" />
    </svg>
  );
}

/**
 * Site-wide light/dark theme toggle. Persists the choice (see ThemeContext) so
 * it survives refreshes and new browser sessions until switched again.
 */
export default function ThemeToggle({ className = '', variant = 'switch' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`${styles.iconToggle} ${className}`}
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={styles.track}>
        <span className={styles.iconSun}><SunIcon /></span>
        <span className={styles.iconMoon}><MoonIcon /></span>
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
