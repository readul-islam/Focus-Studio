import { useMemo } from 'react';
import type { Href } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type {
  CrmContact,
  InboxThread,
  InboxThreadsResponse,
  PaginatedContacts,
  ProjectListItem,
  StudioFinanceData,
  TaskItem,
} from '@focuspilot/shared';
import { parseInboxThreads } from '@/lib/inbox';
import {
  groupSearchResults,
  searchContacts,
  searchInvoices,
  searchProjects,
  searchPurchaseOrders,
  searchTasks,
  type SearchResult,
} from '@/lib/search';
import { api } from '@/lib/api';

async function fetchTasks(): Promise<TaskItem[]> {
  const response = await api.get<TaskItem[]>('/task/user-tasks/');
  return response.data;
}

async function fetchProjects(): Promise<ProjectListItem[]> {
  const response = await api.get<ProjectListItem[]>('/projects/user-projects/');
  return response.data;
}

async function fetchGmailSearch(query: string): Promise<InboxThread[]> {
  const response = await api.get<InboxThread[] | InboxThreadsResponse>('/gmail/search/', {
    params: { q: query, page_size: 8 },
  });
  return parseInboxThreads(response.data);
}

async function fetchContactsSearch(query: string): Promise<CrmContact[]> {
  const response = await api.get<PaginatedContacts>('/crm/studio-contacts/', {
    params: { page: 1, search: query },
  });
  return response.data.results;
}

async function fetchFinance(): Promise<StudioFinanceData> {
  const response = await api.get<StudioFinanceData>('/finance/studio-finance/');
  return response.data;
}

export function useGlobalSearch(query: string, gmailConnected: boolean) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 1;

  const tasksQuery = useQuery({
    queryKey: ['task/user-tasks/'],
    queryFn: fetchTasks,
    staleTime: 60_000,
  });

  const projectsQuery = useQuery({
    queryKey: ['projects/user-projects/'],
    queryFn: fetchProjects,
    staleTime: 60_000,
  });

  const gmailQuery = useQuery({
    queryKey: ['gmail/search', trimmed],
    queryFn: () => fetchGmailSearch(trimmed),
    enabled: enabled && gmailConnected && trimmed.length >= 2,
    staleTime: 30_000,
  });

  const contactsQuery = useQuery({
    queryKey: ['crm/studio-contacts/search', trimmed],
    queryFn: () => fetchContactsSearch(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
  });

  const financeQuery = useQuery({
    queryKey: ['finance/studio-finance'],
    queryFn: fetchFinance,
    staleTime: 60_000,
  });

  const results = useMemo<SearchResult[]>(() => {
    if (!enabled) return [];

    const messageResults: SearchResult[] =
      gmailConnected && trimmed.length >= 2 && gmailQuery.data
        ? gmailQuery.data.map(thread => ({
            id: `message-${thread.thread_id}`,
            type: 'message' as const,
            title: thread.subject || '(No subject)',
            subtitle: thread.sender.split('<')[0]?.trim(),
            href: `/inbox/${encodeURIComponent(thread.thread_id)}` as Href,
          }))
        : [];

    const contactResults =
      trimmed.length >= 2 && contactsQuery.data ? searchContacts(contactsQuery.data, trimmed) : [];

    const finance = financeQuery.data;
    const invoiceResults = finance ? searchInvoices(finance.invoices, trimmed) : [];
    const poResults = finance ? searchPurchaseOrders(finance.purchase_orders, trimmed) : [];

    return [
      ...searchTasks(tasksQuery.data ?? [], trimmed),
      ...searchProjects(projectsQuery.data ?? [], trimmed),
      ...messageResults,
      ...contactResults,
      ...invoiceResults,
      ...poResults,
    ];
  }, [
    enabled,
    trimmed,
    tasksQuery.data,
    projectsQuery.data,
    gmailQuery.data,
    gmailConnected,
    contactsQuery.data,
    financeQuery.data,
  ]);

  const groups = useMemo(() => groupSearchResults(results), [results]);

  return {
    groups,
    results,
    isLoading:
      enabled &&
      (tasksQuery.isLoading || projectsQuery.isLoading || contactsQuery.isLoading || financeQuery.isLoading),
    isSearchingGmail: gmailQuery.isFetching || contactsQuery.isFetching,
    hasQuery: enabled,
  };
}
