import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { TaskItem } from '@focuspilot/shared';
import {
  ErrorState,
  FilterChips,
  ListCard,
  ScreenCanvas,
  StatusBadge,
} from '@/components/design-system';
import { SearchCreateRow } from '@/components/lists/SearchCreateRow';
import { HeaderSearchButton } from '@/components/search/HeaderActions';
import { EmptyState, LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { routes } from '@/lib/routes';
import { formatRelativeDate } from '@/lib/format';
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

async function fetchTasks(): Promise<TaskItem[]> {
  const response = await api.get<TaskItem[]>('/task/user-tasks/');
  return response.data;
}

export default function TasksScreen() {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['task/user-tasks/'],
    queryFn: fetchTasks,
  });

  const tasks = useMemo(() => {
    const list = data ?? [];
    const query = search.trim().toLowerCase();
    return list.filter(task => {
      if (filter !== 'all' && task.status !== filter) return false;
      if (!query) return true;
      const projectName = task.project?.name ?? task.project_name ?? '';
      return (
        task.title.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query)
      );
    });
  }, [data, filter, search]);

  if (isLoading && !data) {
    return <LoadingScreen />;
  }

  if (isError && !data) {
    return (
      <ScreenCanvas>
        <ErrorState title="Couldn't load tasks" onRetry={refetch} />
      </ScreenCanvas>
    );
  }

  return (
    <ScreenCanvas edges={[]}>
      <Stack.Screen options={{ headerRight: () => <HeaderSearchButton /> }} />
      <FlatList
        style={styles.list}
        contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : styles.content}
        data={tasks}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchCreateRow
              value={search}
              onChangeText={setSearch}
              placeholder="Search tasks…"
              onCreate={() => router.push(routes.taskNew)}
              createAccessibilityLabel="Create task"
            />
            <FilterChips options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
          </View>
        }
        renderItem={({ item }) => {
          const projectName = item.project?.name ?? item.project_name;
          const style = taskStatusStyle(item.status);
          return (
            <ListCard
              title={item.title}
              subtitle={projectName}
              meta={item.due_date || item.end_date ? formatRelativeDate(item.due_date ?? item.end_date) : undefined}
              badge={<StatusBadge label={taskStatusLabel(item.status)} color={style.color} backgroundColor={style.bg} />}
              onPress={() => router.push(`/task/${item.id}`)}
            />
          );
        }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            title={filter === 'all' ? 'No tasks assigned' : 'No tasks in this filter'}
            message="Tasks assigned to you will appear here."
          />
        }
      />
    </ScreenCanvas>
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
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
});
