import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function StudioNotFound() {
  const t = await getTranslations("studioProfile.notFoundPage")

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-medium text-stone-900">{t("title")}</h1>
      <p className="mt-2 text-stone-500 max-w-md">{t("description")}</p>
      <Link
        href="https://focuspilot.io"
        className="mt-6 text-sm font-medium text-stone-700 underline hover:text-stone-900"
      >
        {t("backToFocuspilot")}
      </Link>
    </div>
  )
}
