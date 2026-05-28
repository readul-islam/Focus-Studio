/**
 * Inline script to apply theme before React hydrates (prevents light flash).
 * Must match next-themes storageKey and attribute="class".
 */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var key = 'focuspilot-theme';
    var theme = localStorage.getItem(key);
    var root = document.documentElement;
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var darkThemes = ['dark', 'midnight', 'forest', 'terracotta', 'cobalt', 'quartz', 'pink'];
    var isDark =
      darkThemes.indexOf(theme) !== -1 ||
      (theme === 'system' && systemDark) ||
      (!theme && systemDark);
    if (theme && theme !== 'system') {
      root.className = theme;
    } else {
      root.className = isDark ? 'dark' : 'light';
    }
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
