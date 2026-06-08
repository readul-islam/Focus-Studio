import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { ProjectMessageThread } from '@focuspilot/shared';
import { ErrorState, ListCard } from '@/components/design-system';
import { EmptyState } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { formatTimeAgo } from '@/lib/format';
import { api } from '@/lib/api';

async function fetchThreads(projectId: string): Promise<ProjectMessageThread[]> {
  const response = await api.get<ProjectMessageThread[]>(`/gmail/threads/project/${projectId}/`);
  return response.data;
}

function senderName(sender: string): string {
  const name = sender.split('<')[0]?.trim().replace(/^["']|["']$/g, '');
  return name || sender;
}

export default function ProjectMessagesTab() {
  const { projectId } = useProjectHub();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['gmail/threads/project', projectId],
    queryFn: () => fetchThreads(projectId),
    enabled: Boolean(projectId),
  });

  const threads = useMemo(() => data ?? [], [data]);

  if (isError) {
    return (
      <View style={styles.errorWrap}>
        <ErrorState title="Couldn't load messages" message="Connect Gmail on the web app to see project emails." onRetry={refetch} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={threads.length === 0 && !isLoading ? styles.emptyContainer : styles.content}
      data={threads}
      keyExtractor={item => item.thread_id}
      ListHeaderComponent={
        <View style={styles.searchWrap}>
          <Text style={styles.searchHint}>Project email threads linked from your inbox.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ListCard
          title={item.subject || '(No subject)'}
          subtitle={senderName(item.sender)}
          meta={formatTimeAgo(item.received_at)}
          badge={
            !item.is_read ? (
              <View style={styles.unreadDot} />
            ) : undefined
          }
          onPress={() =>
            router.push(`/project/${projectId}/messages/${encodeURIComponent(item.thread_id)}` as Href)
          }
        />
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      ListEmptyComponent={
        isLoading ? null : (
          <EmptyState
            title="Nothing here yet"
            message="Email threads linked to this project will appear here."
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
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  searchWrap: {
    marginBottom: spacing.sm,
  },
  searchHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.clay,
  },
});
