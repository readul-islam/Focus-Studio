/** Theme-aware class tokens for invoice / PO editors (light, dark, and custom appearances). */

export const fd = {
  page: 'min-h-0 flex-1 bg-background p-4 sm:p-6',
  shell: 'mx-auto w-full max-w-4xl rounded-xl border border-border bg-card p-6 shadow-sm sm:p-10',
  title: 'text-2xl font-semibold tracking-tight text-foreground',
  docId: 'text-lg text-muted-foreground',
  sectionTitle: 'mb-5 text-base font-medium uppercase tracking-wide text-foreground',
  sectionDivider: 'mt-8 border-t border-border pt-8',
  subSectionDivider: 'mt-8 border-t border-border pt-6',
  label: 'text-sm font-normal text-foreground',
  metaList: 'space-y-1 text-sm leading-relaxed text-muted-foreground',
  dateTrigger: 'h-10 w-full justify-between rounded-lg border border-border bg-background px-3 text-left font-normal text-foreground hover:bg-muted/50',
  dateTriggerEmpty: 'text-muted-foreground',
  popoverContent: 'w-auto p-0',
  tableWrap: 'overflow-x-auto rounded-xl border border-border bg-muted/20 p-4',
  tableHead: 'pb-4 text-left text-sm font-medium text-muted-foreground',
  tableInput:
    'w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  tableInputDisabled: 'disabled:cursor-not-allowed disabled:opacity-80',
  totalsBox: 'min-w-[220px] space-y-3.5 text-sm font-medium text-foreground',
  totalsHint: 'mt-4 border-t border-border pt-4 text-sm font-medium text-muted-foreground',
  fileUploadLabel:
    'inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50',
  footerActions: 'mt-6 flex justify-end gap-3 border-t border-border py-4',
} as const;

export type FinanceParty = {
  company_name?: string | null;
  name?: string | null;
  surname?: string | null;
};

export function formatPartyName(party?: FinanceParty | null, fallback = '—'): string {
  if (!party) return fallback;
  if (party.company_name?.trim()) return party.company_name.trim();
  const parts = [party.name, party.surname].filter(
    (part): part is string => Boolean(part && String(part).trim() && String(part) !== 'undefined')
  );
  return parts.join(' ').trim() || fallback;
}
