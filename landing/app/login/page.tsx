"use client"

import { Suspense } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { LoginForm } from "@/components/auth/login-form"

function LoginPageContent() {
  const t = useTranslations("authLoginPage")

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white">
        <LoginForm />
      </div>

      <div className="hidden lg:flex lg:flex-1 relative bg-stone-50">
        <div className="absolute inset-0">
          <Image
            src="/images/proposals-kitchen-hero.png"
            alt={t("heroImageAlt")}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">{t("heroTitle")}</h2>
            <p className="text-lg text-white/90 max-w-md">{t("heroSubtitle")}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  const t = useTranslations("authLoginPage")

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-sm text-stone-500">
          {t("loading")}
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
