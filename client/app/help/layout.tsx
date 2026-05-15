import { ReactNode } from 'react';

export default function HelpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-8 py-10">
        {children}
      </main>

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-5xl mx-auto px-8 py-8 text-center">
          <p className="text-sm text-gray-400 mb-2">Can't find what you're looking for?</p>
          <a
            href="mailto:support@techstyles.com"
            className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
          >
            Contact support
          </a>
        </div>
      </footer>
    </div>
  );
}
