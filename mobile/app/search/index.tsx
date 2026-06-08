import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { IntegrationStatus } from '@focuspilot/shared';
import { SectionHeader } from '@/components/design-system';
import { SearchResultRow } from '@/components/search/SearchResultRow';
import { EmptyState } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { api } from '@/lib/api';
import { routes } from '@/lib/routes';

async function fetchIntegrationStatus(): Promise<IntegrationStatus> {
  const response = await api.get<IntegrationStatus>('/user/integration-status/');
  return response.data;
}

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const integrationQuery = useQuery({
    queryKey: ['user/integration-status/'],
    queryFn: fetchIntegrationStatus,
  });

  const gmailConnected = integrationQuery.data?.gmail_connected ?? false;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const { groups, isLoading, isSearchingGmail, hasQuery } = useGlobalSearch(debouncedQuery, gmailConnected);

  const listData = useMemo(
    () =>
      groups.flatMap(group => [
        { type: 'header' as const, key: `header-${group.label}`, label: group.label },
        ...group.items.map(item => ({ type: 'result' as const, key: item.id, item })),
      ]),
    [groups],
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Search' }} />
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Tasks, projects, contacts, finance…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {!hasQuery ? (
        <View style={styles.hints}>
          <HintRow icon="checkbox-outline" label="Find tasks by title or project" />
          <HintRow icon="folder-outline" label="Jump to any project" />
          <HintRow icon="person-outline" label="Search contacts (2+ characters)" />
          <HintRow icon="receipt-outline" label="Find invoices and purchase orders" />
          {gmailConnected ? (
            <HintRow icon="mail-outline" label="Search email threads (2+ characters)" />
          ) : null}
          <Pressable style={styles.createLink} onPress={() => router.push(routes.taskNew)}>
            <Ionicons name="add-circle-outline" size={18} color={colors.clay} />
            <Text style={styles.createLinkText}>Quick create a task</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={listData.length === 0 ? styles.emptyContainer : styles.content}
          data={listData}
          keyExtractor={entry => entry.key}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isSearchingGmail ? (
              <View style={styles.gmailSearching}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.gmailSearchingText}>Searching messages…</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <SectionHeader title={item.label} />;
            }
            return (
              <SearchResultRow result={item.item} onPress={() => router.push(item.item.href)} />
            );
          }}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <EmptyState
                title="No results"
                message={`Nothing matched "${debouncedQuery}". Try different keywords.`}
              />
            )
          }
        />
      )}
    </View>
  );
}

function HintRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.hintRow}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.hintText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 10,
  },
  hints: {
    padding: spacing.md,
    gap: spacing.md,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hintText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.clay,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  gmailSearching: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  gmailSearchingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
