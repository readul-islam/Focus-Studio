"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const handleGoogleSignup = () => {
    console.log("Google signup clicked")
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-16 xl:px-24 bg-white">
        {/* Logo */}
        <div className="mb-8 lg:mb-10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/branding/techstyles-mark-grid-t.png"
              alt="Techstyles monogram"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-cover"
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-stone-900">Techstyles</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm">
          <div className="space-y-3 mb-8">
            <h1 className="text-3xl lg:text-[32px] font-medium text-stone-900 leading-tight">Create your account</h1>
            <p className="text-base text-stone-600">Get started with your free trial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Google Signup */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 lg:h-11 text-base lg:text-sm bg-transparent border-stone-300 hover:bg-stone-50"
              onClick={handleGoogleSignup}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
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

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-stone-700">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12 lg:h-11 text-base lg:text-sm"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 lg:h-11 text-base lg:text-sm"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12 lg:h-11 text-base lg:text-sm"
              />
              <p className="text-xs text-stone-500">Must be at least 8 characters</p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-stone-600 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-stone-900 underline hover:no-underline">
                  Terms of Service
                </Link>
                {" and "}
                <Link href="/privacy" className="text-stone-900 underline hover:no-underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.agreeToTerms}
              className="w-full h-12 lg:h-11 bg-[#E07A57] hover:bg-[#d06a47] text-white text-base lg:text-sm font-medium mt-2"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#E07A57] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Hero Image with Testimonial (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/proposals-kitchen-hero.png"
          alt="Modern kitchen design"
          fill
          className="object-cover"
          priority
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-12 xl:p-16">
          <div className="max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              Transform your design studio workflow
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of interior designers who've streamlined their business with Techstyles.
            </p>

            {/* Testimonial Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="/images/u5454174911-i-need-a-thumbnail-image-of-a-headshot-of-a-femai-25209f6b-0e97-4edd-95f6-51427c50486b-3.png"
                  alt="Tess H."
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-medium">Tess H.</p>
                  <p className="text-white/70 text-sm">Souq. Studio</p>
                </div>
                <div className="flex text-yellow-400 ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                "From proposal to payment, it just works. The AI features save us hours every week and our clients love
                the portal."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
