'use client';

import { usePathname } from 'next/navigation';
import { ProjectNav } from '@/components/project-nav';
import { ProjectNotFound } from '@/components/project/ProjectNotFound';
import useFetch from '@/hooks/useFetch';

export default function ProjectLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const pathname = usePathname();
  const isSettingsPage = pathname.endsWith('/settings') || pathname.includes('/invoices/') || pathname.includes('/purchase-order/');
  
    const { data: projectData, isLoading: projectLoading, refetch,isError: projectError } = useFetch(`projects/projects/${params?.id}`, { enabled: !!params?.id });
  
    
    if(projectLoading){
      return <div className="flex items-center justify-center min-h-screen w-screen fixed inset-0 ">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
    }
    
  
    if(projectError  || params?.id =='null' || params?.id =='undefined') return <ProjectNotFound />

  return (
    <main className="flex-1 bg-stone-50 p-4 sm:p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {!isSettingsPage && (
          <div className="">
            <ProjectNav projectId={params.id} />
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
