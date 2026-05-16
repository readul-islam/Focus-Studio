'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/#product', label: 'Product' },
  { href: '/#features', label: 'Features' },
  { href: '/#workflow', label: 'Workflow' },
  { href: '/pricing', label: 'Pricing' },
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      'rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-stone-100 hover:text-gray-900',
      pathname === href && 'bg-stone-100 font-medium text-gray-900'
    );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/90 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-gray-900 transition-opacity hover:opacity-85"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/Logo.png"
            alt="Focuspilot"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="text-[1.0625rem] font-semibold tracking-[-0.042em] leading-none truncate">
            Focus<span className="font-medium text-gray-500">pilot</span>
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600"
          aria-label="Main"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(href)}
              {...(pathname === href ? { 'aria-current': 'page' as const } : {})}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild className="rounded-lg text-gray-700">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="rounded-lg shadow-sm">
            <Link href="/register">Get started</Link>
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Button asChild size="sm" className="rounded-lg shadow-sm">
            <Link href="/register">Start</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm"
            aria-expanded={open}
            aria-controls="landing-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="landing-mobile-nav"
        className={cn(
          'md:hidden border-t border-gray-200 bg-white px-4 py-4 shadow-lg transition-all',
          open ? 'block' : 'hidden'
        )}
      >
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-lg px-3 py-3 text-sm font-medium text-gray-800 hover:bg-stone-50',
                pathname === href && 'bg-stone-100 text-gray-900'
              )}
              onClick={() => setOpen(false)}
              {...(pathname === href ? { 'aria-current': 'page' as const } : {})}
            >
              {label}
            </Link>
          ))}
          <hr className="my-2 border-gray-100" />
          <Link
            href="/login"
            className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-stone-50"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
