"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/images/branding/techstyles-mark-grid-t.png"
                alt="Techstyles monogram"
                width={24}
                height={24}
                className="h-6 w-6 rounded-md object-cover"
                priority
              />
              <span className="font-semibold tracking-tight">Techstyles</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-stone-900 mb-2">Check your email</h1>
            <p className="text-sm text-stone-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full bg-[#E07A57] hover:bg-[#CE6B4E] text-white">
                <Link href="/auth/login">Back to login</Link>
              </Button>

              <p className="text-xs text-stone-500">
                Didn't receive the email? Check your spam folder or{" "}
                <button onClick={() => setIsSubmitted(false)} className="text-stone-900 hover:underline">
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/images/branding/techstyles-mark-grid-t.png"
              alt="Techstyles monogram"
              width={24}
              height={24}
              className="h-6 w-6 rounded-md object-cover"
              priority
            />
            <span className="font-semibold tracking-tight">Techstyles</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          <div className="mb-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>

            <h1 className="text-xl font-medium text-stone-900 mb-2">Forgot your password?</h1>
            <p className="text-sm text-stone-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#E07A57] hover:bg-[#CE6B4E] text-white text-sm font-medium"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
