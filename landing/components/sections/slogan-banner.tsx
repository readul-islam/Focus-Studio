"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

export default function SloganBanner() {
  const t = useTranslations("homePage.sloganBanner")

  return (
    <section aria-labelledby="slogan" className="bg-white py-14 sm:py-20">
      <div className={container}>
        <div className="relative isolate overflow-hidden rounded-3xl">
          <div className="relative h-[420px] sm:h-[520px] lg:h-[560px]">
            <Image
              src="/images/slogan-hero.png"
              alt={t("imageAlt")}
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              className="object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>

          <div className="pointer-events-none absolute inset-0">
            <div className="pointer-events-auto flex h-full flex-col justify-center">
              <div className="px-6 py-10 sm:px-10">
                <h2
                  id="slogan"
                  className={cn(
                    "text-white drop-shadow-sm",
                    "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight leading-[1.05]",
                  )}
                >
                  <span className="block">{t("line1")}</span>
                  <span className="block">{t("line2")}</span>
                  <span className="block">{t("line3")}</span>
                </h2>
              </div>
            </div>

            <div className="pointer-events-auto absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
              <CtaButton
                href="/signup"
                variant="white"
                size="lg"
                label={t("cta")}
                showArrow
                arrowVariant="olive"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
