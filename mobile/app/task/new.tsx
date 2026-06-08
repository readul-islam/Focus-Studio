import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { TaskForm } from '@/components/tasks/TaskForm';
import type { TaskFormValues } from '@/lib/task-form';

export default function NewTaskScreen() {
  const params = useLocalSearchParams<{ projectId?: string; phaseId?: string }>();

  const initialValues = useMemo<Partial<TaskFormValues>>(() => {
    const projectId = params.projectId ? Number(params.projectId) : null;
    const phaseId = params.phaseId ? Number(params.phaseId) : null;
    return {
      ...(projectId && !Number.isNaN(projectId) ? { projectId } : {}),
      ...(phaseId && !Number.isNaN(phaseId) ? { phaseId } : {}),
    };
  }, [params.projectId, params.phaseId]);

  return (
    <>
      <Stack.Screen options={{ title: 'New task', presentation: 'modal' }} />
      <TaskForm
        mode="create"
        initialValues={initialValues}
        onSuccess={id => router.replace(`/task/${id}`)}
        onCancel={() => router.back()}
      />
    </>
  );
}
