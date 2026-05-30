"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { AuthBrandMark } from "@/components/auth/auth-brand-mark"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { apiErrorMessage, fetchData, postData } from "@/lib/api"
import { redirectToApp } from "@/lib/auth"

const RESEND_COOLDOWN = 60

function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return email
  const visible =
    local.length <= 2 ? local : local[0] + "•".repeat(local.length - 2) + local[local.length - 1]
  return `${visible}@${domain}`
}

export default function VerifyOtpPage() {
  const t = useTranslations("authVerifyOtpPage")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [stage, setStage] = useState<"loading" | "entry" | "submitting" | "success" | "no-session">("loading")
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    fetchData<{ email?: string }>("/user/otp-session/")
      .then((data) => {
        if (data?.email) {
          setEmail(data.email)
          setStage("entry")
        } else {
          setStage("no-session")
        }
      })
      .catch(() => setStage("no-session"))
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const submitOtp = useCallback(
    async (value: string) => {
      if (value.length !== 6 || stage === "submitting") return
      setStage("submitting")
      setError("")
      try {
        await postData("/user/verify-otp/", { otp: value })
        setStage("success")
        setTimeout(() => redirectToApp("/onboarding"), 1200)
      } catch (err) {
        setError(apiErrorMessage(err, t("incorrectCode")))
        setOtp("")
        setStage("entry")
      }
    },
    [stage, t],
  )

  useEffect(() => {
    if (otp.length === 6 && stage === "entry") {
      submitOtp(otp)
    }
  }, [otp, stage, submitOtp])

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    setError("")
    try {
      await postData("/user/resend-otp/", {})
      setResendCooldown(RESEND_COOLDOWN)
      setOtp("")
    } catch {
      setError(t("resendFailed"))
    } finally {
      setIsResending(false)
    }
  }

  const handleUseDifferentAccount = async () => {
    try {
      await postData("/user/logout/", {})
    } catch {
      /* ignore */
    }
    router.push("/signup")
  }

  if (stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    )
  }

  if (stage === "no-session") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-stone-400" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">{t("noSession.title")}</h1>
          <p className="text-sm text-stone-500 mb-6">{t("noSession.message")}</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("noSession.backToRegistration")}
          </Link>
        </div>
      </div>
    )
  }

  if (stage === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-1">{t("success.title")}</h1>
          <p className="text-sm text-stone-500">{t("success.message")}</p>
          <Loader2 className="w-5 h-5 animate-spin text-stone-400 mx-auto mt-4" />
        </div>
      </div>
    )
  }

  const resendTime = `0:${String(resendCooldown).padStart(2, "0")}`

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-sm mx-auto py-10">
          <AuthBrandMark className="mb-10" />

          <div className="mb-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-5">
              <Mail className="w-6 h-6 text-stone-600" />
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 mb-1.5">{t("entry.title")}</h1>
            <p className="text-sm text-stone-500">
              {t("entry.message", { email: maskEmail(email) })}
            </p>
          </div>

          <div className="mb-6">
            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={stage === "submitting"} autoFocus>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-12 h-12 text-base rounded-lg border border-stone-200"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error ? (
            <p className="text-xs text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={() => submitOtp(otp)}
            disabled={otp.length !== 6 || stage === "submitting"}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-50 mb-4"
          >
            {stage === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("entry.verifying")}
              </>
            ) : (
              t("entry.verifyEmail")
            )}
          </button>

          <div className="text-center mb-6">
            <p className="text-sm text-stone-500 mb-1">{t("entry.noCode")}</p>
            {resendCooldown > 0 ? (
              <p className="text-sm text-stone-400">{t("entry.resendIn", { time: resendTime })}</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-900 hover:underline disabled:opacity-50"
              >
                {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {t("entry.resendCode")}
              </button>
            )}
          </div>

          <div className="pt-5 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={handleUseDifferentAccount}
              className="text-sm text-stone-400 hover:text-stone-600"
            >
              {t("entry.useDifferentAccount")}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-center w-[52%] bg-[#1a2e2a] px-14 py-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            {t("hero.titleLine1")}
            <br />
            {t("hero.titleLine2")}
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">{t("hero.subtitle")}</p>
        </div>
      </div>
    </div>
  )
}
