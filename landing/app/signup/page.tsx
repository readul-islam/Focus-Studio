"use client"

import Image from "next/image"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-16 xl:px-24 bg-white">
        <SignupForm />
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/proposals-kitchen-hero.png"
          alt="Modern kitchen design"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 xl:p-16">
          <div className="max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              Transform your design studio workflow
            </h2>
            <p className="text-lg text-white/90">
              Join interior designers who run projects, clients, and procurement in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
