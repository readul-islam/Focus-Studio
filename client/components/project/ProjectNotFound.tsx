'use client';

import { Button } from '@/components/ui/button';
import { FolderX, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectNotFoundProps {
  message?: string;
  showBackButton?: boolean;
}

export function ProjectNotFound({
  message = "The project you're looking for doesn't exist or has been deleted.",
  showBackButton = true
}: ProjectNotFoundProps) {
  const router = useRouter();

  return (
    <div className="flex-1 bg-stone flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
          <FolderX className="w-10 h-10 text-gray-400" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Project Not Found
        </h1>

        <p className="text-gray-500 mb-8">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          )}
          <Button
            onClick={() => router.push('/projects')}
            className="gap-2 bg-gray-900 hover:bg-gray-800"
          >
            <Home className="w-4 h-4" />
            All Projects
          </Button>
        </div>
      </div>
    </div>
  );
}