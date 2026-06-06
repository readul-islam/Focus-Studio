'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Copy, Trash2, Pencil } from 'lucide-react';
import type { Presentation } from './types';
import { useTranslations } from 'next-intl';

type Props = {
  presentation: Presentation;
  onRename: (p: Presentation) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  canEdit: boolean;
};

export function PresentationCard({
  presentation,
  onRename,
  onDuplicate,
  onDelete,
  canEdit,
}: Props) {
  const t = useTranslations('presentationsPage');

  return (
    <div className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/presentations/${presentation.id}`} className="block">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {presentation.thumbnail_url ? (
            <img
              src={presentation.thumbnail_url}
              alt={presentation.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, hsl(var(--muted)) 0, hsl(var(--muted)) 10px, hsl(var(--muted-foreground) / 0.08) 10px, hsl(var(--muted-foreground) / 0.08) 20px)',
              }}
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium truncate">{presentation.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {presentation.project_name} · {t('card.edited')}{' '}
            {formatDistanceToNow(new Date(presentation.updated_at), { addSuffix: true })}
          </p>
        </div>
      </Link>
      {canEdit && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRename(presentation)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('card.rename')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(presentation.id)}>
                <Copy className="mr-2 h-4 w-4" />
                {t('card.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(presentation.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('card.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
