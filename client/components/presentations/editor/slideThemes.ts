export type SlideTheme = {
  id: string;
  labelKey: string;
  background_color: string;
  text_color?: string;
};

export const SLIDE_THEMES: SlideTheme[] = [
  { id: 'white', labelKey: 'slideFormat.themes.white', background_color: '#FFFFFF' },
  { id: 'light', labelKey: 'slideFormat.themes.light', background_color: '#F8FAFC' },
  { id: 'ocean', labelKey: 'slideFormat.themes.ocean', background_color: '#EFF6FF' },
  { id: 'mint', labelKey: 'slideFormat.themes.mint', background_color: '#ECFDF5' },
  { id: 'sand', labelKey: 'slideFormat.themes.sand', background_color: '#FFFBEB' },
  { id: 'rose', labelKey: 'slideFormat.themes.rose', background_color: '#FFF1F2' },
  { id: 'lavender', labelKey: 'slideFormat.themes.lavender', background_color: '#FAF5FF' },
  { id: 'slate', labelKey: 'slideFormat.themes.slate', background_color: '#1E293B', text_color: '#F8FAFC' },
  { id: 'charcoal', labelKey: 'slideFormat.themes.charcoal', background_color: '#18181B', text_color: '#FAFAFA' },
  { id: 'midnight', labelKey: 'slideFormat.themes.midnight', background_color: '#0F172A', text_color: '#F1F5F9' },
];

export function findThemeByColor(color: string): SlideTheme | undefined {
  const normalized = color.toUpperCase();
  return SLIDE_THEMES.find((t) => t.background_color.toUpperCase() === normalized);
}
