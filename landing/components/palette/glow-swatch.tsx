"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type GlowSwatchProps = {
  label: string
  description?: string
  gradient: string
  cssSnippet: string
  className?: string
}

export function GlowSwatch({ label, description, gradient, cssSnippet, className }: GlowSwatchProps) {
  const { toast } = useToast()

  async function copy() {
    try {
      await navigator.clipboard.writeText(cssSnippet)
      toast({ title: "Copied", description: `${label} CSS added to clipboard.` })
    } catch {
      toast({ title: "Copy failed", description: "Select and copy the code manually." })
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-stone-900">{label}</div>
            {description ? <div className="mt-1 text-xs text-stone-600">{description}</div> : null}
          </div>
          <Button variant="outline" size="sm" onClick={copy}>
            Copy CSS
          </Button>
        </div>

        {/* Preview tile */}
        <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
          <div className="relative h-40 w-full" style={{ background: gradient }} aria-label={`${label} glow preview`}>
            {/* Subtle grain for realism */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
            />
          </div>
        </div>

        {/* Code snippet (readonly visual) */}
        <pre className="mt-4 overflow-x-auto rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-800">
          {cssSnippet}
        </pre>
      </CardContent>
    </Card>
  )
}
