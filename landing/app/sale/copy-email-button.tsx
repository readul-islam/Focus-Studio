"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"

export function CopyEmailButton({
  email,
  variant = "default",
}: {
  email: string
  variant?: "default" | "compact"
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold px-4 py-2 text-xs transition-all active:scale-95 ml-auto"
        title="Copy email to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-stone-400" />
            <span>Copy Email</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full text-center rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold py-3.5 px-6 border border-stone-700 transition-all flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400">Email Copied to Clipboard!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 text-stone-400" />
          <span>Copy Email Address</span>
        </>
      )}
    </button>
  )
}
