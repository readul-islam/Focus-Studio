import type { Href } from 'expo-router';
import type {
  CrmContact,
  FinanceInvoice,
  FinancePurchaseOrder,
  InboxThread,
  ProjectListItem,
  TaskItem,
} from '@focuspilot/shared';
import { contactDisplayName } from '@/lib/crm';
import { financePartyName, invoiceDisplayId, poDisplayId, projectName } from '@/lib/finance';

export type SearchResultType = 'task' | 'project' | 'message' | 'contact' | 'invoice' | 'purchase_order';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  meta?: string;
  href: Href;
}

function matchesQuery(value: string | undefined | null, query: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(query);
}

export function searchTasks(tasks: TaskItem[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return tasks
    .filter(
      task =>
        matchesQuery(task.title, q) ||
        matchesQuery(task.project?.name ?? task.project_name, q) ||
        matchesQuery(task.assignee?.name, q),
    )
    .slice(0, 12)
    .map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      title: task.title,
      subtitle: task.project?.name ?? task.project_name,
      meta: task.status,
      href: `/task/${task.id}` as Href,
    }));
}

export function searchProjects(projects: ProjectListItem[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return projects
    .filter(
      project =>
        matchesQuery(project.name, q) ||
        matchesQuery(project.project_name, q) ||
        matchesQuery(project.client_name, q),
    )
    .slice(0, 8)
    .map(project => ({
      id: `project-${project.id}`,
      type: 'project' as const,
      title: project.project_name ?? project.name,
      subtitle: project.client_name,
      href: `/project/${project.id}` as Href,
    }));
}

export function searchInboxThreads(threads: InboxThread[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return threads
    .filter(
      thread =>
        matchesQuery(thread.subject, q) ||
        matchesQuery(thread.snippet, q) ||
        matchesQuery(thread.sender, q) ||
        matchesQuery(thread.project?.name, q),
    )
    .slice(0, 8)
    .map(thread => ({
      id: `message-${thread.thread_id}`,
      type: 'message' as const,
      title: thread.subject || '(No subject)',
      subtitle: thread.sender.split('<')[0]?.trim(),
      href: `/inbox/${encodeURIComponent(thread.thread_id)}` as Href,
    }));
}

export function searchContacts(contacts: CrmContact[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return contacts
    .filter(
      contact =>
        matchesQuery(contactDisplayName(contact), q) ||
        matchesQuery(contact.company_name, q) ||
        matchesQuery(contact.email, q) ||
        matchesQuery(contact.phone, q),
    )
    .slice(0, 8)
    .map(contact => ({
      id: `contact-${contact.id}`,
      type: 'contact' as const,
      title: contactDisplayName(contact),
      subtitle: contact.company_name ?? contact.email ?? undefined,
      href: `/contacts/${contact.id}` as Href,
    }));
}

export function searchInvoices(invoices: FinanceInvoice[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return invoices
    .filter(
      invoice =>
        matchesQuery(invoiceDisplayId(invoice), q) ||
        matchesQuery(financePartyName(invoice.client), q) ||
        matchesQuery(projectName(invoice.project), q),
    )
    .slice(0, 6)
    .map(invoice => ({
      id: `invoice-${invoice.id}`,
      type: 'invoice' as const,
      title: invoiceDisplayId(invoice),
      subtitle: financePartyName(invoice.client),
      meta: invoice.status,
      href: `/finance/invoice/${invoice.id}` as Href,
    }));
}

export function searchPurchaseOrders(purchaseOrders: FinancePurchaseOrder[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return purchaseOrders
    .filter(
      po =>
        matchesQuery(poDisplayId(po), q) ||
        matchesQuery(financePartyName(po.supplier), q) ||
        matchesQuery(projectName(po.project), q),
    )
    .slice(0, 6)
    .map(po => ({
      id: `po-${po.id}`,
      type: 'purchase_order' as const,
      title: poDisplayId(po),
      subtitle: financePartyName(po.supplier),
      meta: po.status,
      href: `/finance/purchase-order/${po.id}` as Href,
    }));
}

export function groupSearchResults(results: SearchResult[]) {
  const groups: { label: string; items: SearchResult[] }[] = [];
  const tasks = results.filter(r => r.type === 'task');
  const projects = results.filter(r => r.type === 'project');
  const messages = results.filter(r => r.type === 'message');
  const contacts = results.filter(r => r.type === 'contact');
  const invoices = results.filter(r => r.type === 'invoice');
  const purchaseOrders = results.filter(r => r.type === 'purchase_order');

  if (tasks.length) groups.push({ label: 'Tasks', items: tasks });
  if (projects.length) groups.push({ label: 'Projects', items: projects });
  if (messages.length) groups.push({ label: 'Messages', items: messages });
  if (contacts.length) groups.push({ label: 'Contacts', items: contacts });
  if (invoices.length) groups.push({ label: 'Invoices', items: invoices });
  if (purchaseOrders.length) groups.push({ label: 'Purchase orders', items: purchaseOrders });

  return groups;
}
