import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThreadRow } from '@/components/inbox/ThreadRow';
import { FilterChips, LoadingInline } from '@/components/design-system';
import { EmptyState, Input, LoadingScreen, Button } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useInbox } from '@/hooks/useInbox';
import { filterInboxThreads, inboxUnreadCount, type InboxFilter } from '@/lib/inbox';
import { StackHeaderActions } from '@/components/navigation/StackHeaderActions';
import { routes } from '@/lib/routes';
import { api } from '@/lib/api';
import { openStudioWebPath } from '@/lib/web';

const filterOptions: { key: InboxFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function InboxScreen() {
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [search, setSearch] = useState('');
  const { threads, gmailConnected, isLoading, isError, isRefetching, refresh, markAsRead } = useInbox();

  useEffect(() => {
    if (gmailConnected) {
      api.post('/gmail/fetch/', {}).catch(() => {});
    }
  }, [gmailConnected]);

  const filtered = useMemo(() => filterInboxThreads(threads, filter, search), [threads, filter, search]);
  const unreadCount = useMemo(() => inboxUnreadCount(threads), [threads]);

  const handleOpenThread = (threadId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(threadId);
    }
    router.push(`/inbox/${encodeURIComponent(threadId)}` as Href);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!gmailConnected) {
    return (
      <>
        <Stack.Screen options={{ title: 'Inbox', headerRight: () => <StackHeaderActions /> }} />
        <View style={styles.connectWrap}>
        <View style={styles.connectCard}>
          <View style={styles.connectIcon}>
            <Ionicons name="mail-outline" size={28} color={colors.textMuted} />
          </View>
          <Text style={styles.connectTitle}>Connect Gmail</Text>
          <Text style={styles.connectMessage}>
            Connect Gmail in the Studio web app, then pull to refresh here. Your inbox threads will sync automatically.
          </Text>
          <Button
            label="Connect Gmail in browser"
            onPress={() => void openStudioWebPath('/settings/studio/integrations')}
          />
          <Button
            label="Integration status"
            variant="secondary"
            onPress={() => router.push(routes.settingsIntegrations)}
          />
        </View>
      </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <StackHeaderActions>
              <Pressable
                onPress={() => router.push(routes.inboxCompose)}
                style={({ pressed }) => [styles.composeButton, pressed && styles.composeButtonPressed]}
                hitSlop={8}
                accessibilityLabel="Compose email"
              >
                <Ionicons name="create-outline" size={22} color={colors.text} />
              </Pressable>
            </StackHeaderActions>
          ),
        }}
      />
      <FlatList
      style={styles.list}
      contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.content}
      data={filtered}
      keyExtractor={item => item.thread_id}
      ListHeaderComponent={
        <View style={styles.header}>
          {!gmailConnected ? null : (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </Text>
            </View>
          )}
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search subject, sender, project…"
            leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
          />
          <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
          {isError ? (
            <Text style={styles.errorHint}>Couldn't refresh. Pull down to try again.</Text>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <ThreadRow thread={item} onPress={() => handleOpenThread(item.thread_id, item.is_read)} />
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        isRefetching ? (
          <LoadingInline />
        ) : (
          <EmptyState
            title={filter === 'unread' ? 'No unread messages' : 'Nothing here yet'}
            message={
              search
                ? 'Try a different search term.'
                : 'Email threads from your connected Gmail account appear here.'
            }
          />
        )
      }
      />
    </>
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  errorHint: {
    fontSize: 13,
    color: colors.danger,
  },
  connectWrap: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    padding: spacing.md,
  },
  connectCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  connectIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  connectTitle: {
    ...typography.subheading,
    fontSize: 17,
  },
  connectMessage: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  composeButton: {
    marginRight: spacing.sm,
    padding: 4,
  },
  composeButtonPressed: {
    opacity: 0.7,
  },
});
