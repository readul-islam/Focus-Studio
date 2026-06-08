import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router, Stack } from 'expo-router';
import { ContactRow } from '@/components/crm/ContactRow';
import { CrmHubTabs } from '@/components/crm/CrmHubTabs';
import { SearchCreateRow } from '@/components/lists/SearchCreateRow';
import { StackHeaderActions } from '@/components/navigation/StackHeaderActions';
import { HeaderSearchButton } from '@/components/search/HeaderActions';
import { FilterChips } from '@/components/design-system';
import { EmptyState, LoadingScreen } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useContacts } from '@/hooks/useContacts';
import type { ContactFilter } from '@/lib/crm';
import { routes } from '@/lib/routes';

const typeFilters: { key: ContactFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'clients', label: 'Clients' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'contractors', label: 'Contractors' },
];

export default function ContactsScreen() {
  const [filter, setFilter] = useState<ContactFilter>('all');
  const [search, setSearch] = useState('');
  const { contacts, totalCount, isLoading, isError, isRefetching, isFetchingNextPage, refresh, loadMore } =
    useContacts(search, filter);

  const summary = useMemo(() => {
    if (totalCount === 0) return null;
    return `${totalCount} contact${totalCount === 1 ? '' : 's'}`;
  }, [totalCount]);

  if (isLoading && contacts.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <StackHeaderActions>
              <HeaderSearchButton />
            </StackHeaderActions>
          ),
        }}
      />
      <FlatList
      style={styles.list}
      contentContainerStyle={contacts.length === 0 ? styles.emptyContainer : styles.content}
      data={contacts}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <CrmHubTabs />
          {summary ? <Text style={styles.summary}>{summary}</Text> : null}
          <SearchCreateRow
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, company, email…"
            onCreate={() => router.push(routes.contactNew)}
            createAccessibilityLabel="Create contact"
          />
          <FilterChips options={typeFilters} value={filter} onChange={setFilter} />
          {isError ? (
            <Text style={styles.errorHint}>Couldn't refresh. Pull down to try again.</Text>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <ContactRow contact={item} onPress={() => router.push(`/contacts/${item.id}` as Href)} />
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        isRefetching ? null : (
          <EmptyState
            title="Nothing here yet"
            message={
              search
                ? 'Try a different search term.'
                : 'Tap + to add a client, supplier, or contractor.'
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
  summary: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorHint: {
    fontSize: 13,
    color: colors.danger,
  },
  footerLoader: {
    paddingVertical: spacing.md,
  },
});
