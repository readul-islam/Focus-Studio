"use client"

import type React from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { AuthBrandMark } from "@/components/auth/auth-brand-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { apiErrorMessage, fieldError, registerUser } from "@/lib/api"
import { passwordStrength, signupIsValid, type SignupForm, type SignupErrors } from "@/lib/auth-validation"

type SignupFormProps = {
  loginHref?: string
}

export function SignupForm({ loginHref = "/login" }: SignupFormProps) {
  const t = useTranslations("authSignupPage.form")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const validateSignup = useMemo(() => {
    const validateName = (v: string) => {
      if (!v) return t("validation.nameRequired")
      if (!/^[A-Za-z\s'-]{2,}$/.test(v)) return t("validation.nameInvalid")
    }

    const validateEmail = (v: string) => {
      if (!v) return t("validation.emailRequired")
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) return t("validation.emailInvalid")
    }

    const validatePassword = (v: string) => {
      if (!v) return t("validation.passwordRequired")
      if (v.length < 8) return t("validation.passwordMinLength")
      if (!/[A-Z]/.test(v)) return t("validation.passwordUppercase")
      if (!/[a-z]/.test(v)) return t("validation.passwordLowercase")
      if (!/\d/.test(v)) return t("validation.passwordNumber")
      if (!/[@$!%*?&]/.test(v)) return t("validation.passwordSpecial")
    }

    const validateConfirm = (v: string, pw: string) => {
      if (!v) return t("validation.confirmRequired")
      if (v !== pw) return t("validation.confirmMismatch")
    }

    return (d: SignupForm): SignupErrors => ({
      name: validateName(d.name),
      email: validateEmail(d.email),
      password: validatePassword(d.password),
      confirmPassword: validateConfirm(d.confirmPassword, d.password),
    })
  }, [t])

  const strengthLabel = useMemo(() => {
    return (s: number) => {
      if (s <= 1) return { label: t("strength.weak"), color: "bg-red-400" }
      if (s <= 3) return { label: t("strength.fair"), color: "bg-amber-400" }
      if (s === 4) return { label: t("strength.good"), color: "bg-blue-400" }
      return { label: t("strength.strong"), color: "bg-emerald-400" }
    }
  }, [t])

  const handleChange = (field: keyof SignupForm, value: string) => {
    const next = { ...formData, [field]: value }
    setFormData(next)
    if (touched[field]) {
      setErrors(validateSignup(next))
    }
  }

  const handleBlur = (field: keyof SignupForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors(validateSignup(formData))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched = { name: true, email: true, password: true, confirmPassword: true }
    setTouched(allTouched)
    const validation = validateSignup(formData)
    setErrors(validation)
    if (!signupIsValid(validation) || !agreeToTerms) return

    setIsLoading(true)
    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })
      router.push("/verify-otp")
    } catch (error) {
      const emailErr = fieldError(error, "email")
      if (emailErr) {
        setErrors((prev) => ({ ...prev, email: emailErr }))
        setTouched((prev) => ({ ...prev, email: true }))
      } else {
        setErrors((prev) => ({
          ...prev,
          form: apiErrorMessage(error, t("registrationFailed")),
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const pwStrength = passwordStrength(formData.password)
  const { label: strengthText, color: strengthColor } = strengthLabel(pwStrength)

  const inputClass = (field: keyof SignupForm) =>
    `h-12 lg:h-11 text-base lg:text-sm ${
      errors[field] && touched[field] ? "border-red-400 focus-visible:ring-red-200" : ""
    }`

  return (
    <div className="w-full max-w-sm">
      <AuthBrandMark className="mb-10" />

      <div className="space-y-3 mb-8">
        <h1 className="text-3xl lg:text-[32px] font-medium text-stone-900 leading-tight">{t("title")}</h1>
        <p className="text-base text-stone-600">{t("subtitle")}</p>
      </div>

      {errors.form ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{errors.form}</p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-5">
        <GoogleAuthButton
          mode="signup"
          label={t("googleSignUp")}
          className="w-full h-12 lg:h-11 text-base lg:text-sm bg-transparent border-stone-300 hover:bg-stone-50"
        />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-stone-500">{t("orDivider")}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">{t("fullName")}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            required
            className={inputClass("name")}
          />
          {errors.name && touched.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            required
            className={inputClass("email")}
          />
          {errors.email && touched.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            required
            className={inputClass("password")}
          />
          {formData.password ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i <= pwStrength ? strengthColor : "bg-stone-200"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500">{t("strengthLabel", { level: strengthText })}</p>
            </div>
          ) : null}
          {errors.password && touched.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            required
            className={inputClass("confirmPassword")}
          />
          {errors.confirmPassword && touched.confirmPassword ? (
            <p className="text-xs text-red-600">{errors.confirmPassword}</p>
          ) : null}
        </div>

        <div className="flex items-start space-x-3 pt-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm text-stone-600 leading-relaxed">
            {t("agreeTermsBefore")}{" "}
            <Link href="/terms" className="text-stone-900 underline hover:no-underline">
              {t("termsOfService")}
            </Link>{" "}
            {t("and")}{" "}
            <Link href="/privacy" className="text-stone-900 underline hover:no-underline">
              {t("privacyPolicy")}
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !agreeToTerms}
          className="w-full h-12 lg:h-11 bg-[#E07A57] hover:bg-[#d06a47] text-white text-base lg:text-sm font-medium mt-2"
        >
          {isLoading ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-600">
        {t("hasAccount")}{" "}
        <Link href={loginHref} className="text-[#E07A57] font-medium hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  )
}
