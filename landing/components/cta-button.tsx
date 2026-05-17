"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import * as LucideReact from "lucide-react"
import { cn } from "@/lib/utils"
import type * as React from "react"

type Variant = "white" | "black" | "grey" | "slate" | "clay" | "outline"
type ArrowVariant = "brand" | "white" | "black" | "grey" | "muted" | "olive"

export type CtaButtonProps = {
  label?: string
  href?: string
  variant?: Variant
  className?: string
  type?: "button" | "submit" | "reset"
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  showArrow?: boolean
  arrowVariant?: ArrowVariant
  "aria-label"?: string
  children?: React.ReactNode
}

export function CtaButton({
  label,
  href,
  variant = "black",
  className,
  type = "button",
  onClick,
  showArrow = false,
  arrowVariant = "brand",
  children,
  ...rest
}: CtaButtonProps) {
  const base = "inline-flex items-center justify-between rounded-lg font-medium transition-colors shadow-sm ring-1"
  // Use !important to override base Button sizing - all buttons should be exactly 40px (h-10)
  // Also override py-2 from base Button's default size variant
  const sizing = "!h-10 !py-0 px-4 text-sm"

  const variantClasses: Record<Variant, string> = {
    white: "bg-white text-stone-900 ring-stone-200 hover:bg-stone-50",
    black: "bg-stone-900 text-white ring-stone-900 hover:bg-stone-800",
    grey: "bg-stone-100 text-stone-900 ring-stone-200 hover:bg-stone-200",
    slate:
      "!bg-[#4B5960] !text-white !ring-[#4B5960] hover:!bg-[#39444A] active:!bg-[#2E3840] focus-visible:ring-2 focus-visible:ring-[#B6B0A4]/50",
    clay: "!bg-[#E07A57] !text-white !ring-[#E07A57] hover:!bg-[#CE6B4E] active:!bg-[#B85A42]",
    outline: "bg-transparent text-stone-900 ring-stone-300 hover:bg-stone-100",
  }

  const arrowClasses: Record<ArrowVariant, string> = {
    brand: "bg-[#f7cf52] text-stone-900",
    white: "bg-white text-stone-900 ring-1 ring-stone-200",
    black: "bg-stone-900 text-white",
    grey: "bg-stone-200 text-stone-900",
    muted: "bg-stone-100 text-stone-900 ring-1 ring-stone-200",
    olive: "bg-[#6E7A58] text-white",
  }

  const inlineStyles =
    variant === "clay"
      ? {
          backgroundColor: "#E07A57",
          color: "#ffffff",
          borderColor: "#E07A57",
        }
      : undefined

  const displayContent = children || label || "Learn more"

  const content = (
    <span className={cn("flex w-full items-center gap-3", showArrow ? "justify-between" : "justify-center")}>
      <span className="truncate">{displayContent}</span>
      {showArrow ? (
        <span
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            arrowClasses[arrowVariant],
          )}
          aria-hidden="true"
        >
          <LucideReact.ArrowRight className="h-2.5 w-2.5" />
        </span>
      ) : null}
    </span>
  )

  const ariaLabel = rest["aria-label"] ?? (typeof displayContent === "string" ? displayContent : undefined)

  if (href) {
    return (
      <Button asChild className={cn(base, sizing, variantClasses[variant], className)} style={inlineStyles} {...rest}>
        <Link href={href} aria-label={ariaLabel}>
          {content}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      className={cn(base, sizing, variantClasses[variant], className)}
      style={inlineStyles}
      {...rest}
    >
      {content}
    </Button>
  )
}
