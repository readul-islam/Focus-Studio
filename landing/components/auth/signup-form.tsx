"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthBrandMark } from "@/components/auth/auth-brand-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { apiErrorMessage, fieldError, registerUser } from "@/lib/api"
import {
  passwordStrength,
  signupIsValid,
  strengthLabel,
  validateSignup,
  type SignupForm,
  type SignupErrors,
} from "@/lib/auth-validation"

type SignupFormProps = {
  loginHref?: string
}

export function SignupForm({ loginHref = "/login" }: SignupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [googleNotice, setGoogleNotice] = useState("")
  const [formData, setFormData] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const handleChange = (field: keyof SignupForm, value: string) => {
    const next = { ...formData, [field]: value }
    setFormData(next)
    if (touched[field]) {
      setErrors(validateSignup(next))
    }
  }

  const handleBlur = (field: keyof SignupForm) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validateSignup(formData))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGoogleNotice("")
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
          form: apiErrorMessage(error, "Registration failed. Please try again."),
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
        <h1 className="text-3xl lg:text-[32px] font-medium text-stone-900 leading-tight">Create your account</h1>
        <p className="text-base text-stone-600">Start your free trial — verify your email to continue</p>
      </div>

      {errors.form ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{errors.form}</p>
      ) : null}
      {googleNotice ? (
        <p className="text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 mb-4">
          {googleNotice}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 lg:h-11 text-base lg:text-sm bg-transparent border-stone-300 hover:bg-stone-50"
          onClick={() => setGoogleNotice("Google sign-up is coming soon. Use email and password for now.")}
        >
          Sign up with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-stone-500">or</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
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
          <Label htmlFor="email">Email address</Label>
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
          <Label htmlFor="password">Password</Label>
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
              <p className="text-xs text-stone-500">Strength: {strengthText}</p>
            </div>
          ) : null}
          {errors.password && touched.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
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
            I agree to the{" "}
            <Link href="/terms" className="text-stone-900 underline hover:no-underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-stone-900 underline hover:no-underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !agreeToTerms}
          className="w-full h-12 lg:h-11 bg-[#E07A57] hover:bg-[#d06a47] text-white text-base lg:text-sm font-medium mt-2"
        >
          {isLoading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link href={loginHref} className="text-[#E07A57] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
