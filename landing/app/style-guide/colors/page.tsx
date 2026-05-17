"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

type Swatch = {
  name: string
  hex: string
  note?: string
}

type Group = {
  title: string
  items: Swatch[]
}

const groups: Group[] = [
  {
    title: "Brand clay",
    items: [
      { name: "Clay 600 (buttons/hover)", hex: "#CE6B4E" },
      { name: "Clay 500 (primary)", hex: "#E07A57" },
      { name: "Clay 400 (tint)", hex: "#E68E71" },
      { name: "Clay 200 (pill/bg)", hex: "#F1BBAA" },
      { name: "Clay 50 (wash)", hex: "#FBEAE1" },
    ],
  },
  {
    title: "Warm neutrals (greige/bone)",
    items: [
      { name: "Bone 50 (page base)", hex: "#FAF7F2" },
      { name: "Greige 100 (panel)", hex: "#EFEAE2" },
      { name: "Greige 300 (AI container base)", hex: "#D9D5CC" },
      { name: "Greige 500 (borders)", hex: "#B6B0A4" },
      { name: "Taupe 700 (sub-headers)", hex: "#7D786C" },
    ],
  },
  {
    title: "Earth accents (sparingly)",
    items: [
      { name: "Ochre 500 (highlight/CTA alt)", hex: "#C78A3B" },
      { name: "Ochre 300 (badge)", hex: "#D8A864" },
      { name: "Umber 600 (strong accent)", hex: "#6A4B3C" },
      { name: "Terracotta 600 (deep warmth)", hex: "#B75A41" },
    ],
  },
  {
    title: "Greens (natural balance)",
    items: [
      { name: "Sage 500 (accent)", hex: "#8FA58F" },
      { name: "Sage 300 (chips)", hex: "#B9C7B7" },
      { name: "Olive 600 (muted accent)", hex: "#6E7A58" },
    ],
  },
  {
    title: "Cool counterpoints",
    items: [
      { name: "Slate 500 (link/secondary)", hex: "#6B7C85" },
      { name: "Slate 700 (icons on warm bg)", hex: "#4B5960" },
    ],
  },
  {
    title: "Text and utility",
    items: [
      { name: "Ink (primary text)", hex: "#1F1D1A" },
      { name: "Ink-muted (body copy)", hex: "#4E4943" },
      { name: "On-dark text", hex: "#FFFFFF" },
      { name: "Border-soft", hex: "#E5E0D8" },
      { name: "Border-strong", hex: "#C9C3B8" },
    ],
  },
]

// Simple relative luminance calculation to choose white/ink text
function getTextColor(bgHex: string) {
  const hex = bgHex.replace("#", "")
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255
  const [R, G, B] = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B
  // Threshold tuned for this warm palette
  return luminance > 0.6 ? "#1F1D1A" : "#FFFFFF"
}

function SwatchTile({ s }: { s: Swatch }) {
  const { toast } = useToast()
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(s.hex)
      toast({ title: "Copied", description: `${s.name} (${s.hex})` })
    } catch {
      toast({ title: "Copy failed", description: "Please copy the HEX manually." })
    }
  }
  const text = getTextColor(s.hex)
  const subtleRing = text === "#FFFFFF" ? "ring-black/10" : "ring-black/5"

  return (
    <Card className={cn("overflow-hidden border-stone-200")}>
      <CardContent className="p-0">
        <div className="relative h-28 w-full sm:h-32" style={{ backgroundColor: s.hex }}>
          <div className="absolute inset-0 flex items-end justify-between p-3">
            <div
              className={cn(
                "inline-flex max-w-[75%] items-center gap-2 rounded-md px-2 py-1 text-xs",
                "backdrop-blur-sm ring-1",
                subtleRing,
              )}
              style={{
                color: text,
                backgroundColor: text === "#FFFFFF" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.6)",
              }}
              aria-label={`${s.name} ${s.hex}`}
            >
              <span className="truncate font-medium">{s.name}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-transparent"
              onClick={onCopy}
              aria-label={`Copy ${s.hex}`}
            >
              {s.hex}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function GlowTile({
  label,
  gradient,
}: {
  label: string
  gradient: string
}) {
  return (
    <Card className="overflow-hidden border-stone-200">
      <CardContent className="p-0">
        <div className="relative h-28 w-full sm:h-32" style={{ background: gradient }}>
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />
          <div className="absolute bottom-2 left-2 rounded-md bg-white/80 px-2 py-1 text-xs ring-1 ring-black/5">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ColorsPage() {
  return (
    <main className="bg-white py-10 sm:py-14">
      <div className={container}>
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">Color Swatch Reference</h1>
          <p className="mt-3 text-stone-600">
            Visual swatches for your modern warm, earthy, clay‑centric palette. Click a chip to copy its HEX.
          </p>
        </header>

        <section className="mt-8 space-y-10">
          {groups.map((g) => (
            <div key={g.title} className="space-y-4">
              <h2 className="text-xl font-medium tracking-tight text-stone-900">{g.title}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {g.items.map((s) => (
                  <SwatchTile key={s.name} s={s} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-medium tracking-tight text-stone-900">Overlays / Glows</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <GlowTile
              label="Earth glow (light)"
              gradient="radial-gradient(60% 46% at 50% 0%, rgba(231,222,207,0.12) 0%, rgba(231,222,207,0.05) 42%, transparent 72%)"
            />
            <GlowTile
              label="Clay glow (warm)"
              gradient="radial-gradient(60% 46% at 50% 0%, rgba(224,122,87,0.14) 0%, rgba(224,122,87,0.06) 42%, transparent 72%)"
            />
            <GlowTile
              label="Sage glow (fresh)"
              gradient="radial-gradient(60% 46% at 50% 0%, rgba(143,165,143,0.14) 0%, rgba(143,165,143,0.06) 42%, transparent 72%)"
            />
          </div>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-stone-900">Suggested roles (summary)</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
                <li>Page background: Bone 50</li>
                <li>Section bands: Greige 100 or Clay 50</li>
                <li>Washed panels: Greige 300 with 6–18% texture overlay</li>
                <li>Cards: White on Bone 50; borders in Greige 500 at 12–18% opacity</li>
                <li>Primary button: Clay 600 on White; hover Clay 700 (#A14A35)</li>
                <li>Secondary: Greige 100 / Ink; hover Greige 300</li>
                <li>Quiet: White / Taupe 700; hover Border‑soft</li>
                <li>Success: Sage 500; bg Sage 300; text Ink</li>
                <li>Warning: Ochre 500; bg Ochre 300; text Ink</li>
                <li>Info: Slate 500; bg Slate 500 at 10–14%; text Slate 700</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-stone-900">Optional token names</h3>
              <pre className="mt-3 rounded-md bg-stone-50 p-3 text-xs leading-relaxed text-stone-800">
                {`:root {
  --color-brand: #E07A57;
  --bg-page: #FAF7F2;
  --bg-panel: #D9D5CC;
  --text-primary: #1F1D1A;
  --text-muted: #4E4943;
  --accent-ochre: #C78A3B;
  --accent-sage: #8FA58F;
  --border: #B6B0A4;
}`}
              </pre>
              <p className="mt-2 text-xs text-stone-600">
                Note: This is a reference only. No styles were applied to the site.
              </p>
            </CardContent>
          </Card>
        </section>

        <footer className="mx-auto mt-10 max-w-3xl text-center text-xs text-stone-500">
          Reference-only page. No existing files were modified.
        </footer>
      </div>
    </main>
  )
}
