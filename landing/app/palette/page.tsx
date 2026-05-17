import { GlowSwatch } from "@/components/palette/glow-swatch"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

// New warm earthy options
const GLOWS = {
  blushClay: "radial-gradient(60% 46% at 50% 0%, rgba(224,122,87,0.12) 0%, rgba(224,122,87,0.05) 42%, transparent 72%)",
  sandstone:
    "radial-gradient(60% 46% at 50% 0%, rgba(214,177,150,0.14) 0%, rgba(214,177,150,0.06) 42%, transparent 72%)",
  wheat: "radial-gradient(60% 46% at 50% 0%, rgba(228,214,182,0.16) 0%, rgba(228,214,182,0.07) 42%, transparent 72%)",
  copperRose:
    "radial-gradient(60% 46% at 50% 0%, rgba(201,134,102,0.12) 0%, rgba(201,134,102,0.05) 42%, transparent 72%)",
  // Previous options (kept for reference)
  earth: "radial-gradient(60% 46% at 50% 0%, rgba(231,222,207,0.12) 0%, rgba(231,222,207,0.05) 42%, transparent 72%)",
  greige: "radial-gradient(60% 46% at 50% 0%, rgba(217,213,204,0.18) 0%, rgba(217,213,204,0.07) 42%, transparent 72%)",
  sage: "radial-gradient(60% 46% at 50% 0%, rgba(134,239,172,0.14) 0%, rgba(134,239,172,0.06) 42%, transparent 72%)",
} as const

const blushClayCSS = `/* Blush Clay glow (light terracotta) */
background: radial-gradient(60% 46% at 50% 0%,
  rgba(224,122,87,0.12) 0%,
  rgba(224,122,87,0.05) 42%,
  transparent 72%
);`

const sandstoneCSS = `/* Sandstone glow (warm beige‑rose) */
background: radial-gradient(60% 46% at 50% 0%,
  rgba(214,177,150,0.14) 0%,
  rgba(214,177,150,0.06) 42%,
  transparent 72%
);`

const wheatCSS = `/* Wheat glow (light warm wheat) */
background: radial-gradient(60% 46% at 50% 0%,
  rgba(228,214,182,0.16) 0%,
  rgba(228,214,182,0.07) 42%,
  transparent 72%
);`

const copperRoseCSS = `/* Copper Rose glow (muted copper‑rose) */
background: radial-gradient(60% 46% at 50% 0%,
  rgba(201,134,102,0.12) 0%,
  rgba(201,134,102,0.05) 42%,
  transparent 72%
);`

// Previous references (still copyable if needed)
const earthCSS = `/* Earth glow */
background: radial-gradient(60% 46% at 50% 0%,
  rgba(231,222,207,0.12) 0%,
  rgba(231,222,207,0.05) 42%,
  transparent 72%
);`

const greigeCSS = `/* Greige glow */
background: radial-gradient(60% 46% at 50% 0%,
  rgba(217,213,204,0.18) 0%,
  rgba(217,213,204,0.07) 42%,
  transparent 72%
);`

const sageCSS = `/* Sage glow */
background: radial-gradient(60% 46% at 50% 0%,
  rgba(134,239,172,0.14) 0%,
  rgba(134,239,172,0.06) 42%,
  transparent 72%
);`

export default function PalettePage() {
  return (
    <main className="bg-white py-12 sm:py-16">
      <div className={container}>
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">Hero Glow Swatches</h1>
          <p className="mt-3 text-stone-600">
            New warm, earthy options to complement the clay block. Click Copy CSS to use any glow without changing the
            site yet.
          </p>
        </header>

        {/* New options first */}
        <section className="mx-auto mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          <GlowSwatch
            label="Blush Clay"
            description="Airy terracotta—ties directly to the clay brand tone."
            gradient={GLOWS.blushClay}
            cssSnippet={blushClayCSS}
          />
          <GlowSwatch
            label="Sandstone"
            description="Warm beige‑rose; modern and understated."
            gradient={GLOWS.sandstone}
            cssSnippet={sandstoneCSS}
          />
          <GlowSwatch
            label="Wheat"
            description="Light wheat—brightens while staying earthy."
            gradient={GLOWS.wheat}
            cssSnippet={wheatCSS}
          />
          <GlowSwatch
            label="Copper Rose"
            description="Muted copper‑rose; a touch richer than blush clay."
            gradient={GLOWS.copperRose}
            cssSnippet={copperRoseCSS}
          />
        </section>

        {/* Keep prior options available if needed */}
        <section className="mx-auto mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <GlowSwatch label="Earth" description="(previous)" gradient={GLOWS.earth} cssSnippet={earthCSS} />
          <GlowSwatch label="Greige" description="(previous)" gradient={GLOWS.greige} cssSnippet={greigeCSS} />
          <GlowSwatch label="Sage" description="(previous)" gradient={GLOWS.sage} cssSnippet={sageCSS} />
        </section>

        <footer className="mx-auto mt-10 max-w-3xl text-center text-sm text-stone-600">
          Tip: layer a subtle grain at opacity 0.04–0.08 over any glow for natural texture.
        </footer>
      </div>
    </main>
  )
}
