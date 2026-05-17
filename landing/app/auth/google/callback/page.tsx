"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthBrandMark } from "@/components/auth/auth-brand-mark"
import { googleAuthErrorMessage } from "@/lib/google-auth"
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
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Completing sign-in…")

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
      setMessage(googleAuthErrorMessage(code))
      return
    }

    setMessage("Invalid callback. Please try signing in again.")
  }, [searchParams])

  const isError = searchParams.get("status") === "error"

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <AuthBrandMark className="mb-8" />
      <p className={`text-sm ${isError ? "text-red-600" : "text-stone-600"}`}>{message}</p>
      {isError ? (
        <p className="mt-6 text-sm text-stone-600">
          <Link href="/login" className="font-medium text-stone-900 hover:underline">
            Back to sign in
          </Link>
          {" · "}
          <Link href="/signup" className="font-medium text-stone-900 hover:underline">
            Create account
          </Link>
        </p>
      ) : null}
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-stone-600">Completing sign-in…</p>}>
        <GoogleCallbackContent />
      </Suspense>
    </div>
  )
}
