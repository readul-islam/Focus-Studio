import { CheckCircle2 } from 'lucide-react';

const FEATURES = [
  'Project & task management',
  'Client communication hub',
  'Finance & invoicing',
  'AI-powered inbox',
] as const;

/**
 * Right-hand marketing column on auth pages — matches landing hero background treatment
 * (stone-50 + clay / navy radial washes).
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[52%] flex-col justify-center gap-12 overflow-hidden bg-stone-50 px-14 py-10 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(15,23,42,0.06),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(15 23 42 / 0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />

      <div className="relative z-10">
        <div className="mb-16 inline-flex items-center gap-2 rounded-full border border-clay-200/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-clay-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-clay-500" />
          </span>
          Now in early access
        </div>

        <h2 className="mb-5 text-4xl font-bold leading-tight text-gray-900">
          The operating system
          <br />
          for <span className="text-clay-700">interior designers</span>
        </h2>
        <p className="max-w-sm text-base leading-relaxed text-gray-600">
          Manage projects, clients, finances, and team communication — all in one place.
        </p>

        <ul className="mt-10 space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-clay-100 ring-1 ring-clay-200/60">
                <CheckCircle2 className="h-3 w-3 text-clay-600" strokeWidth={2.5} />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 rounded-2xl border border-gray-200/90 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          &ldquo;Focuspilot has completely changed how we run projects. Our team spends less time on
          admin and more time designing.&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-100 text-xs font-semibold text-clay-800">
            S
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900">Sarah Mitchell</p>
            <p className="text-xs text-gray-500">Principal Designer, Studio M</p>
          </div>
        </div>
      </div>
    </div>
  );
}
