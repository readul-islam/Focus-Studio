'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ProjectPresenceEntry } from '@/hooks/useProjectCollaboration';
import useUser from '@/hooks/useUser';

function initials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ProjectPresenceStrip({
  presence,
  className = '',
}: {
  presence: ProjectPresenceEntry[];
  className?: string;
}) {
  const { user: currentUser } = useUser();
  const viewers = presence.filter(p => p.user?.id !== currentUser?.id);

  if (viewers.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-600 ${className}`}>
      <span className="font-medium text-gray-500">Viewing now</span>
      <div className="flex -space-x-2">
        {viewers.slice(0, 5).map(entry => (
          <Avatar key={entry.id} className="h-7 w-7 border-2 border-white">
            <AvatarImage src={entry.user?.profile_picture || undefined} alt={entry.user?.name} />
            <AvatarFallback className="text-[10px] bg-stone-200">
              {initials(entry.user?.name || '?')}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span>
        {viewers.length === 1
          ? viewers[0].user?.name
          : `${viewers.length} teammates`}
      </span>
    </div>
  );
}
