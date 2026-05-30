import enDictionary from "../messages/en-US.json"
import jaDictionary from "../messages/ja-JP.json"

/** Deep-merge overlay onto base; overlay values win, base fills missing keys. */
export function mergeMessagesWithFallback(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(overlay)) {
    const existing = result[key]
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing !== null &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      result[key] = mergeMessagesWithFallback(
        existing as Record<string, unknown>,
        value as Record<string, unknown>,
      )
    } else {
      result[key] = value
    }
  }

  return result
}

const localeBundles = {
  "en-US": enDictionary,
  "ja-JP": jaDictionary,
} as const

export function loadLocaleMessages(locale: string, defaultLocale: keyof typeof localeBundles) {
  const localeMessages = localeBundles[locale as keyof typeof localeBundles] ?? localeBundles[defaultLocale]

  if (locale === defaultLocale) {
    return localeMessages
  }

  return mergeMessagesWithFallback(
    localeBundles[defaultLocale] as Record<string, unknown>,
    localeMessages as Record<string, unknown>,
  )
}
