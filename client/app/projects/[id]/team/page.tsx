'use client';

import { useEffect } from 'react';
import { ProjectTeamChat } from '@/components/project/ProjectTeamChat';

export default function ProjectTeamPage({ params }: { params: { id: string } }) {
  useEffect(() => {
    document.title = 'Team | Focuspilot';
  }, []);

  return <ProjectTeamChat projectId={params.id} />;
}
