import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ProjectForm } from '@/components/projects/ProjectForm';

export default function NewProjectScreen() {
  const params = useLocalSearchParams<{ clientId?: string }>();

  const initialClientId = useMemo(() => {
    if (!params.clientId) return null;
    const id = Number(params.clientId);
    return Number.isNaN(id) ? null : id;
  }, [params.clientId]);

  return (
    <>
      <Stack.Screen options={{ title: 'New project', presentation: 'modal' }} />
      <ProjectForm
        initialClientId={initialClientId}
        onSuccess={id => router.replace(`/project/${id}`)}
        onCancel={() => router.back()}
      />
    </>
  );
}
