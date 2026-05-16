import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/login', label: 'Sign in' },
  { href: '/register', label: 'Create account' },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">Focuspilot</p>
            <p className="max-w-md text-sm text-gray-500">
              The operating system for interior design studios — projects, clients, finance, and team
              workflows in one place.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-600">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-gray-900 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 border-t border-gray-100 pt-8 text-center text-xs text-gray-400 sm:text-left">
          © {new Date().getFullYear()} Focuspilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
