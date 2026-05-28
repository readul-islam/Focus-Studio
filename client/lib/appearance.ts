export type AppearanceTheme =
  | 'system'
  | 'light'
  | 'dark'
  | 'midnight'
  | 'forest'
  | 'terracotta'
  | 'cobalt'
  | 'quartz'
  | 'pink';
export type AppearanceDensity = 'comfortable' | 'compact' | 'spacious';

export type AppearancePrefs = {
  theme: AppearanceTheme;
  density: AppearanceDensity;
  accent_color: string | null;
};

export const DEFAULT_APPEARANCE: AppearancePrefs = {
  theme: 'system',
  density: 'comfortable',
  accent_color: null,
};

const ACCENT_CSS_VARS = ['--primary', '--ring', '--sidebar-primary'] as const;

/** Convert #rrggbb to space-separated HSL components for `hsl(var(--primary))`. */
export function hexToHslComponents(hex: string): string | null {
  const normalized = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyAppearanceToDocument(prefs: AppearancePrefs) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-density', prefs.density);

  if (prefs.accent_color) {
    const hsl = hexToHslComponents(prefs.accent_color);
    if (hsl) {
      for (const variable of ACCENT_CSS_VARS) {
        root.style.setProperty(variable, hsl);
      }
      return;
    }
  }

  for (const variable of ACCENT_CSS_VARS) {
    root.style.removeProperty(variable);
  }
}

export function clearAppearanceFromDocument() {
  applyAppearanceToDocument(DEFAULT_APPEARANCE);
}

/** Convert space-separated CSS HSL values (e.g. "222 30% 6%") to a standard Hex string. */
export function hslToHex(hslStr: string): string {
  if (!hslStr) return '#000000';
  const clean = hslStr.trim().replace(/%/g, '');
  const parts = clean.split(/\s+/);
  if (parts.length < 3) return '#000000';

  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}
