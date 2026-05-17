import Image from "next/image"
import { cn } from "@/lib/utils"

type AuthBrandMarkProps = {
  className?: string
}

/** Focuspilot logo + wordmark for auth pages (SSR-safe, no framer-motion). */
export function AuthBrandMark({ className }: AuthBrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/brand/Logo.png"
        alt="Focuspilot"
        width={35}
        height={35}
        className="object-contain"
        priority
      />
      <span className="relative inline-flex flex-col items-stretch select-none pt-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500">
        <span className="text-[1.0625rem] font-semibold tracking-[-0.042em] leading-none text-gray-900">
          Focus
          <span className="font-medium text-gray-500">pilot</span>
        </span>
        <svg
          className="mt-1 h-[5px] w-full shrink-0 text-[#E07A57]/55"
          viewBox="0 0 104 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M2 5.25C22 1.5 42 1.5 52 3.25C62 5 82 5 102 1.75"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
    </div>
  )
}
