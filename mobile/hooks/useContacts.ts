import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { PaginatedContacts } from '@focuspilot/shared';
import { contactTypeQuery, type ContactFilter } from '@/lib/crm';
import { api } from '@/lib/api';

const PAGE_SIZE = 20;

async function fetchContactsPage(
  page: number,
  search: string,
  filter: ContactFilter,
): Promise<PaginatedContacts> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (search.trim()) params.set('search', search.trim());
  const contactType = contactTypeQuery(filter);
  if (contactType) params.set('contact_type', contactType);

  const response = await api.get<PaginatedContacts>(`/crm/studio-contacts/?${params.toString()}`);
  return response.data;
}

export function useContacts(search: string, filter: ContactFilter) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: ['crm/studio-contacts', debouncedSearch, filter],
    queryFn: ({ pageParam }) => fetchContactsPage(pageParam, debouncedSearch, filter),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (!lastPage.next) return undefined;
      const loaded = lastPageParam * PAGE_SIZE;
      return loaded < lastPage.count ? lastPageParam + 1 : undefined;
    },
  });

  const contacts = useMemo(
    () => query.data?.pages.flatMap(page => page.results) ?? [],
    [query.data?.pages],
  );

  const totalCount = query.data?.pages[0]?.count ?? 0;

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    contacts,
    totalCount,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    isFetchingNextPage: query.isFetchingNextPage,
    refresh: query.refetch,
    loadMore,
    hasMore: Boolean(query.hasNextPage),
  };
}
