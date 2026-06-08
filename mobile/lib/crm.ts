import type { ContactType, CrmContact } from '@focuspilot/shared';
import { colors } from '@/constants/theme';

export type ContactFilter = 'all' | 'clients' | 'suppliers' | 'contractors';

const CONTACT_TYPE_MAP: Record<Exclude<ContactFilter, 'all'>, ContactType> = {
  clients: 'CL',
  suppliers: 'SP',
  contractors: 'CN',
};

export function contactTypeQuery(filter: ContactFilter): ContactType | undefined {
  if (filter === 'all') return undefined;
  return CONTACT_TYPE_MAP[filter];
}

export function contactTypeLabel(type?: string | null): string {
  switch (type) {
    case 'CL':
      return 'Client';
    case 'SP':
      return 'Supplier';
    case 'CN':
      return 'Contractor';
    default:
      return type ?? 'Contact';
  }
}

export function contactStatusLabel(status?: string | null): string {
  switch (status) {
    case 'NE':
      return 'New';
    case 'AC':
      return 'Active';
    case 'QA':
      return 'Qualified';
    case 'NG':
      return 'Negotiation';
    default:
      return status ?? '—';
  }
}

export function contactDisplayName(contact: CrmContact): string {
  const full = [contact.name, contact.surname].filter(Boolean).join(' ').trim();
  if (full) return full;
  if (contact.company_name) return contact.company_name;
  if (contact.email) return contact.email;
  return 'Unnamed contact';
}

export function contactTypeStyle(type?: string | null): { label: string; color: string; backgroundColor: string } {
  switch (type) {
    case 'CL':
      return { label: 'Client', color: colors.primary, backgroundColor: colors.surfaceElevated };
    case 'SP':
      return { label: 'Supplier', color: colors.clay, backgroundColor: '#F5EDE6' };
    case 'CN':
      return { label: 'Contractor', color: '#5B6B8C', backgroundColor: '#EEF1F6' };
    default:
      return { label: contactTypeLabel(type), color: colors.textSecondary, backgroundColor: colors.surfaceElevated };
  }
}

export function formatAddress(contact: CrmContact): string | null {
  const parts = [
    contact.address_line_1,
    contact.address_line_2,
    contact.city,
    contact.county,
    contact.postcode,
    contact.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}
