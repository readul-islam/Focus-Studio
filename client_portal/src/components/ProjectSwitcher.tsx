'use client';

import { useProjectContext } from '@/context/ProjectContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderKanban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type ProjectSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function ProjectSwitcher({ className, compact = false }: ProjectSwitcherProps) {
  const { projects, project, selectedProjectId, setSelectedProjectId } = useProjectContext();
  const t = useTranslations('projectSwitcher');

  if (projects.length <= 1) {
    if (!project?.project_name) return null;
    return (
      <div className={cn('flex items-center gap-2 min-w-0', className)}>
        <FolderKanban className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
        <span className="truncate text-sm font-medium text-gray-900">{project.project_name}</span>
      </div>
    );
  }

  return (
    <div className={cn('min-w-0', className)}>
      {!compact && (
        <p className="mb-1 text-xs font-medium text-gray-500">{t('label')}</p>
      )}
      <Select
        value={selectedProjectId != null ? String(selectedProjectId) : undefined}
        onValueChange={(value) => setSelectedProjectId(Number(value))}
      >
        <SelectTrigger
          className={cn(
            'w-full bg-white border-gray-200',
            compact ? 'h-9 text-sm' : 'h-10',
          )}
          aria-label={t('label')}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderKanban className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <SelectValue placeholder={t('placeholder')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {projects.map((item) => (
            <SelectItem key={item.project_id} value={String(item.project_id)}>
              {item.project_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
