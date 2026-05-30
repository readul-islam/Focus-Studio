'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ProjectTeamChat } from '@/components/project/ProjectTeamChat';

export default function ProjectTeamPage({ params }: { params: { id: string } }) {
  const t = useTranslations('projectTeamPage');

  useEffect(() => {
    document.title = t('documentTitle');
  }, [t]);

  return <ProjectTeamChat projectId={params.id} />;
}
