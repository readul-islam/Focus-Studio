import { DashboardSidebar } from '@/components/DashboardSidebar';
import { TopBar } from '@/components/TopBar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView?: 'board' | 'list' | 'timeline';
  onViewChange?: (view: 'board' | 'list' | 'timeline') => void;
}

export function DashboardLayout({ children, currentView, onViewChange }: DashboardLayoutProps) {
  return (
    <TooltipProvider>
    <div className="flex min-h-screen w-full bg-white">
      <DashboardSidebar />
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <TopBar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
    </TooltipProvider>
  );
}
