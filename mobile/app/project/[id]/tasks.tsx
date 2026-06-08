import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { TaskItem } from '@focuspilot/shared';
import {
  ErrorState,
  FilterChips,
  ListCard,
  StatusBadge,
} from '@/components/design-system';
import { EmptyState } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { formatRelativeDate } from '@/lib/format';
import { routes } from '@/lib/routes';
import { taskStatusLabel, taskStatusStyle } from '@/lib/task-utils';
import { api } from '@/lib/api';

type TaskFilter = 'all' | 'TD' | 'IP' | 'IR' | 'D';

const FILTER_OPTIONS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'TD', label: 'To-do' },
  { key: 'IP', label: 'In progress' },
  { key: 'IR', label: 'In review' },
  { key: 'D', label: 'Done' },
];

async function fetchProjectTasks(projectId: string): Promise<TaskItem[]> {
  const response = await api.get<TaskItem[]>('/task/user-tasks-project/', {
    params: { project_id: projectId },
  });
  return response.data;
}

export default function ProjectTasksTab() {
  const { projectId } = useProjectHub();
  const [filter, setFilter] = useState<TaskFilter>('all');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['task/user-tasks-project', projectId],
    queryFn: () => fetchProjectTasks(projectId),
    enabled: Boolean(projectId),
  });

  const tasks = useMemo(() => {
    const list = data ?? [];
    if (filter === 'all') return list;
    return list.filter(task => task.status === filter);
  }, [data, filter]);

  if (isError) {
    return (
      <View style={styles.errorWrap}>
        <ErrorState title="Couldn't load tasks" onRetry={refetch} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={tasks.length === 0 && !isLoading ? styles.emptyContainer : styles.content}
      data={tasks}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <FilterChips options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            <Pressable
              style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
              onPress={() => router.push(routes.taskNewForProject(Number(projectId)))}
            >
              <Ionicons name="add" size={18} color={colors.primaryForeground} />
              <Text style={styles.createButtonText}>New</Text>
            </Pressable>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const style = taskStatusStyle(item.status);
        return (
          <ListCard
            title={item.title}
            meta={item.due_date || item.end_date ? formatRelativeDate(item.due_date ?? item.end_date) : undefined}
            badge={<StatusBadge label={taskStatusLabel(item.status)} color={style.color} backgroundColor={style.bg} />}
            onPress={() => router.push(`/task/${item.id}`)}
          />
        );
      }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      ListEmptyComponent={
        isLoading ? null : (
          <EmptyState
            title={filter === 'all' ? 'No tasks on this project' : 'No tasks in this filter'}
            message="Tasks assigned to you on this project appear here."
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createButtonPressed: {
    opacity: 0.85,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
});
