"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { AuthBrandMark } from "@/components/auth/auth-brand-mark"
import { redirectToApp } from "@/lib/auth"

function decodeNextParam(encoded: string | null): string {
  if (!encoded) return "/home/dashboard"
  try {
    const pad = "=".repeat((4 - (encoded.length % 4)) % 4)
    const raw = atob(encoded.replace(/-/g, "+").replace(/_/g, "/") + pad)
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw
  } catch {
    /* ignore */
  }
  return "/home/dashboard"
}

function GoogleCallbackContent() {
  const t = useTranslations("authGoogleCallbackPage")
  const searchParams = useSearchParams()
  const [message, setMessage] = useState(t("completingSignIn"))

  useEffect(() => {
    const status = searchParams.get("status")
    const code = searchParams.get("code")
    const isNew = searchParams.get("is_new") === "1"
    const nextEncoded = searchParams.get("next")

    if (status === "success") {
      const params = new URLSearchParams()
      if (isNew) params.set("is_new", "1")
      if (nextEncoded) params.set("next", nextEncoded)
      const qs = params.toString()
      redirectToApp(`/auth/google/callback${qs ? `?${qs}` : ""}`)
      return
    }

    if (status === "error") {
      const knownErrors = [
        "not_configured",
        "account_exists",
        "email_not_verified",
        "profile_incomplete",
        "access_denied",
        "token_exchange_failed",
        "profile_fetch_failed",
        "invalid_state",
        "no_code",
      ] as const
      const errorKey =
        code && (knownErrors as readonly string[]).includes(code)
          ? (`errors.${code}` as "errors.default")
          : "errors.default"
      setMessage(t(errorKey))
      return
    }

    setMessage(t("invalidCallback"))
  }, [searchParams, t])

  const isError = searchParams.get("status") === "error"

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <AuthBrandMark className="mb-8" />
      <p className={`text-sm ${isError ? "text-red-600" : "text-stone-600"}`}>{message}</p>
      {isError ? (
        <p className="mt-6 text-sm text-stone-600">
          <Link href="/login" className="font-medium text-stone-900 hover:underline">
            {t("backToSignIn")}
          </Link>
          {" · "}
          <Link href="/signup" className="font-medium text-stone-900 hover:underline">
            {t("createAccount")}
          </Link>
        </p>
      ) : null}
    </div>
  )
}

export default function GoogleCallbackPage() {
  const t = useTranslations("authGoogleCallbackPage")

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-stone-600">{t("completingSignIn")}</p>}>
        <GoogleCallbackContent />
      </Suspense>
    </div>
  )
}
