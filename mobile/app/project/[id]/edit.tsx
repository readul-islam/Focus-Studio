import { router } from 'expo-router';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ErrorState, LoadingInline } from '@/components/design-system';
import { useProjectHub } from '@/context/ProjectHubContext';
import { hubProjectToFormValues } from '@/lib/project-form';

export default function EditProjectScreen() {
  const { hubProject, projectId, isLoading, isError, refetch } = useProjectHub();

  if (isLoading && !hubProject) {
    return <LoadingInline />;
  }

  if (isError && !hubProject) {
    return <ErrorState title="Couldn't load project" onRetry={refetch} />;
  }

  if (!hubProject) {
    return <ErrorState title="Project not found" />;
  }

  return (
    <ProjectForm
      projectId={Number(projectId)}
      initialValues={hubProjectToFormValues(hubProject)}
      onSuccess={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
