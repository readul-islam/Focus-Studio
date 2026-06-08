import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TaskDetail } from '@focuspilot/shared';
import { ErrorState, LoadingInline } from '@/components/design-system';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useAuth } from '@/context/AuthContext';
import { taskDetailToFormValues } from '@/lib/task-form';
import { api } from '@/lib/api';

async function fetchTask(id: string): Promise<TaskDetail> {
  const response = await api.get<TaskDetail>(`/task/tasks/${id}/`);
  return response.data;
}

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['task/tasks', id],
    queryFn: () => fetchTask(String(id)),
    enabled: Boolean(id),
  });

  const initialValues = useMemo(
    () => (data ? taskDetailToFormValues(data, user?.id) : undefined),
    [data, user?.id],
  );

  const existingSubtaskIds = data?.subtask?.map(item => item.id) ?? [];

  if (isLoading) {
    return <LoadingInline />;
  }

  if (isError || !data || !initialValues) {
    return <ErrorState title="Couldn't load task" onRetry={refetch} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit task', presentation: 'modal' }} />
      <TaskForm
        mode="edit"
        taskId={data.id}
        initialValues={initialValues}
        existingSubtaskIds={existingSubtaskIds}
        onSuccess={() => router.back()}
        onCancel={() => router.back()}
      />
    </>
  );
}
