"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthBrandMark } from "@/components/auth/auth-brand-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { apiErrorMessage, loginUser } from "@/lib/api"
import { redirectToApp } from "@/lib/auth"

type LoginFormProps = {
  signupHref?: string
  forgotHref?: string
  showBrandMark?: boolean
}

export function LoginForm({
  signupHref = "/signup",
  forgotHref = "/forgot-password",
  showBrandMark = true,
}: LoginFormProps) {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setIsLoading(true)

    try {
      await loginUser(formData.email.trim(), formData.password)
      redirectToApp("/home/dashboard", searchParams.get("next"))
    } catch (error) {
      setFormError(apiErrorMessage(error, "Invalid email or password. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {showBrandMark ? <AuthBrandMark className="mb-10" /> : null}

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Welcome back</h1>
          <p className="text-sm text-stone-600">Sign in to your Focuspilot studio account</p>
        </div>

        {formError ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <GoogleAuthButton
            mode="login"
            label="Sign in with Google"
            nextPath={searchParams.get("next")}
            showIcon
            className="w-full h-10 text-sm bg-transparent"
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-500">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-stone-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-10 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-stone-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-10 text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked === true })}
              />
              <Label htmlFor="remember" className="text-xs text-stone-600">
                Remember me
              </Label>
            </div>
            <Link href={forgotHref} className="text-xs text-stone-600 hover:text-stone-900 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-stone-900 text-white hover:bg-stone-800 text-sm"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-xs text-stone-600">
          Don&apos;t have an account?{" "}
          <Link href={signupHref} className="font-medium text-stone-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
