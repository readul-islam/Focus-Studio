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
  const [googleNotice, setGoogleNotice] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setGoogleNotice("")
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
        {googleNotice ? (
          <p className="text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
            {googleNotice}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 text-sm bg-transparent"
            onClick={() => setGoogleNotice("Google sign-in is coming soon. Use email and password for now.")}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

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
