import { ReactNode } from 'react';

export default function ChangelogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-8 py-10">
        {children}
      </main>
    </div>
  );
}
