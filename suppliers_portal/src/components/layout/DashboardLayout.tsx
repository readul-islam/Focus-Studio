import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav, TopBar } from '@/components/layout/TopBar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto pb-20 md:pb-6">
          <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">{children}</div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
