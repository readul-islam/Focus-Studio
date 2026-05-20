export type AppearanceTheme = 'system' | 'light' | 'dark';
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

/** Color Hunt dark palette defaults */
export const DARK_PALETTE = {
  background: '#37353E',
  surface: '#44444E',
  primary: '#715A5A',
  text: '#D3DAD9',
} as const;

const ACCENT_VARS = {
  primary: ['--primary', '--primary-foreground'] as const,
  sidebar: ['--sidebar-primary', '--sidebar-primary-foreground'] as const,
  ring: ['--ring'] as const,
};

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

/** WCAG-style relative luminance (0–1). */
export function getRelativeLuminance(hex: string): number {
  const normalized = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return 0;

  const channels = [0, 2, 4].map(i => {
    const c = parseInt(normalized.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Pick readable text on top of a fill color (light or dark). */
export function getContrastForegroundHex(backgroundHex: string): string {
  return getRelativeLuminance(backgroundHex) > 0.45 ? DARK_PALETTE.background : DARK_PALETTE.text;
}

function setPair(root: HTMLElement, bgVar: string, fgVar: string, bgHex: string) {
  const bgHsl = hexToHslComponents(bgHex);
  const fgHsl = hexToHslComponents(getContrastForegroundHex(bgHex));
  if (!bgHsl) return;
  root.style.setProperty(bgVar, bgHsl);
  if (fgHsl) root.style.setProperty(fgVar, fgHsl);
}

function clearVars(root: HTMLElement, vars: readonly string[]) {
  for (const v of vars) root.style.removeProperty(v);
}

export function applyAppearanceToDocument(prefs: AppearancePrefs) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-density', prefs.density);

  const allAccentVars = [
    ...ACCENT_VARS.primary,
    ...ACCENT_VARS.sidebar,
    ...ACCENT_VARS.ring,
  ];

  if (prefs.accent_color) {
    const hsl = hexToHslComponents(prefs.accent_color);
    if (hsl) {
      setPair(root, '--primary', '--primary-foreground', prefs.accent_color);
      setPair(root, '--sidebar-primary', '--sidebar-primary-foreground', prefs.accent_color);
      root.style.setProperty('--ring', hsl);
      return;
    }
  }

  clearVars(root, allAccentVars);
}

export function clearAppearanceFromDocument() {
  applyAppearanceToDocument(DEFAULT_APPEARANCE);
}
