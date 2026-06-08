import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ErrorState, FilterChips, ScreenCanvas } from '@/components/design-system';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { SearchCreateRow } from '@/components/lists/SearchCreateRow';
import { HeaderSearchButton } from '@/components/search/HeaderActions';
import { EmptyState, LoadingScreen } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { routes } from '@/lib/routes';
import { filterProjects, mapUserProject, type ProjectFilter, type UserProject } from '@/lib/projects';
import { api } from '@/lib/api';

const filterOptions: { key: ProjectFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Complete' },
];

async function fetchProjects(): Promise<UserProject[]> {
  const response = await api.get<Record<string, unknown>[]>('/projects/user-projects/');
  return response.data.map(item => mapUserProject(item as Parameters<typeof mapUserProject>[0]));
}

export default function ProjectsScreen() {
  const [filter, setFilter] = useState<ProjectFilter>('active');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['projects/user-projects/'],
    queryFn: fetchProjects,
  });

  const projects = useMemo(
    () => filterProjects(data ?? [], filter, search),
    [data, filter, search],
  );

  const summary = useMemo(() => {
    const total = data?.length ?? 0;
    if (total === 0) return null;
    const active = data?.filter(project => project.status === 'AC').length ?? 0;
    return `${active} active · ${total} total`;
  }, [data]);

  if (isLoading && !data) {
    return <LoadingScreen />;
  }

  if (isError && !data) {
    return (
      <ScreenCanvas>
        <ErrorState title="Couldn't load projects" onRetry={refetch} />
      </ScreenCanvas>
    );
  }

  return (
    <ScreenCanvas edges={[]}>
      <Stack.Screen options={{ headerRight: () => <HeaderSearchButton /> }} />
      <FlatList
        style={styles.list}
        contentContainerStyle={projects.length === 0 ? styles.emptyContainer : styles.content}
        data={projects}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            {summary ? <Text style={styles.summary}>{summary}</Text> : null}
            <SearchCreateRow
              value={search}
              onChangeText={setSearch}
              placeholder="Search projects, clients, codes…"
              onCreate={() => router.push(routes.projectNew)}
              createAccessibilityLabel="Create project"
            />
            <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
          </View>
        }
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={() => router.push(`/project/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            title={search ? 'No matching projects' : 'No projects yet'}
            message={
              search
                ? 'Try a different search term or filter.'
                : 'Tap + to create a project, or wait for assignments from your team.'
            }
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
    padding: spacing.md,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summary: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
