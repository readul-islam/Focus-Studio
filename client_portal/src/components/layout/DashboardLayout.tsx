import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { TopBar } from '@/components/TopBar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView?: 'board' | 'list' | 'timeline';
  onViewChange?: (view: 'board' | 'list' | 'timeline') => void;
}

export function DashboardLayout({ children, currentView, onViewChange }: DashboardLayoutProps) {
  const location = useLocation();
  const showSubNav = !location.pathname.includes('/crm/communications');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar />
        <div className="flex-1 h-screen flex flex-col min-w-0 bg-gray-50">
          <TopBar />
          <main className="flex-1 bg-gray-50 overflow-auto pb-16 md:pb-0">
            <div className=" mx-auto pb-6">
              <div className="mx-auto max-w-7xl space-y-6 rounded-xl">
                {/* {showSubNav && (
                  <DashboardSubNav
                    currentView={currentView}
                    onViewChange={onViewChange}
                  />
                )} */}
                <div className="p-3 md:p-6">{children}</div>
              </div>
            </div>
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
