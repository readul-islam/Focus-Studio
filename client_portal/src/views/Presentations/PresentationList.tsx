'use client';

import React, { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Presentation } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { useTranslations } from 'next-intl';
import { usePageTitle } from '@/lib/portal-i18n';

type PresentationItem = {
  id: number;
  title: string;
  project_name: string;
  thumbnail_url?: string | null;
  slide_count: number;
  updated_at: string;
};

export default function PresentationList() {
  const t = useTranslations('presentations');
  const pageTitle = usePageTitle();
  const navigate = useNavigate();
  const { user } = useUser();
  const projectId = user?.project?.id;
  const [search, setSearch] = useState('');

  const { data, isLoading } = useFetch(
    projectId ? `client_portal/presentations/?project_id=${projectId}` : null,
    { enabled: !!projectId }
  );

  const presentations: PresentationItem[] = Array.isArray(data) ? data : [];
  const filtered = presentations.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Helmet title={pageTitle(t('pageTitle'))} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{t('loading')}</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Presentation className="h-12 w-12 mx-auto mb-4 opacity-40" />
              {t('empty')}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/presentations/${p.id}`)}
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Presentation className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {p.slide_count} {t('slides')} · {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
