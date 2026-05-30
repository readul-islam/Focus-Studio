"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import { AuthBrandMark } from "@/components/auth/auth-brand-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiErrorMessage, postData } from "@/lib/api"

export default function ForgotPasswordPage() {
  const t = useTranslations("authForgotPasswordPage")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await postData("/user/forgot-password/", { email: email.trim() })
      setIsSubmitted(true)
    } catch (err) {
      setError(apiErrorMessage(err, t("sendFailed")))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <AuthBrandMark className="mb-8 justify-center" />
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-xl font-medium text-stone-900 mb-2">{t("success.title")}</h1>
            <p className="text-sm text-stone-600 mb-6">{t("success.message", { email })}</p>
            <Button asChild className="w-full bg-stone-900 hover:bg-stone-800 text-white">
              <Link href="/login">{t("backToLogin")}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <AuthBrandMark className="mb-8" />

        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToLogin")}
          </Link>

          <h1 className="text-xl font-medium text-stone-900 mb-2">{t("title")}</h1>
          <p className="text-sm text-stone-600 mb-6">{t("subtitle")}</p>

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-stone-900 hover:bg-stone-800 text-white">
              {isLoading ? t("sending") : t("sendResetLink")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
