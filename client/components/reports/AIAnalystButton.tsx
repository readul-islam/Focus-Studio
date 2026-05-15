'use client';

import Link from 'next/link';

function GeminiStar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 13.5 8.5 17 12C13.5 15.5 12 22 12 22C12 22 10.5 15.5 7 12C10.5 8.5 12 2 12 2Z" fill="currentColor" />
      <path d="M2 12C2 12 8.5 10.5 12 7C15.5 10.5 22 12 22 12C22 12 15.5 13.5 12 17C8.5 13.5 2 12 2 12Z" fill="currentColor" />
    </svg>
  );
}

export function AIAnalystButton() {
  return (
    <Link href="/reports/overview?ai=open">
      <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm border border-clay-200/60 bg-gradient-to-br from-neutral-50 via-[#f5ede4] to-[#f5ede4]/20 hover:shadow-md hover:brightness-95 text-clay-700">
        <span className="text-clay-500 animate-pulse">
          <GeminiStar size={15} />
        </span>
        AI Analyst
      </button>
    </Link>
  );
}
