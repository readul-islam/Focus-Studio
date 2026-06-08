import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrmContact, FinanceInvoice } from '@focuspilot/shared';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { SectionHeader } from '@/components/design-system';
import { Button } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { contactDisplayName } from '@/lib/crm';
import { getApiErrorMessage } from '@/lib/api-errors';
import {
  buildLineItemsPayload,
  lineItemsFromApi,
  validateDraftLineItems,
  type DraftLineItem,
} from '@/lib/finance-draft';
import { mapUserProject } from '@/lib/projects';
import { hapticSuccess } from '@/lib/haptics';
import { api } from '@/lib/api';
import { DraftLineItemsForm } from '@/components/finance/DraftLineItemsForm';
import { FinancePickerField, type FinancePickerOption } from '@/components/finance/FinancePickerField';

type InvoiceDraftEditorProps = {
  invoice: FinanceInvoice;
  onSaved: () => void;
};

export function InvoiceDraftEditor({ invoice, onSaved }: InvoiceDraftEditorProps) {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<number | null>(invoice.project?.id ?? null);
  const [clientId, setClientId] = useState<number | null>(invoice.client?.id ?? null);
  const [issueDate, setIssueDate] = useState(invoice.date ?? '');
  const [dueDate, setDueDate] = useState(invoice.due_date ?? '');
  const [lineItems, setLineItems] = useState<DraftLineItem[]>(() => lineItemsFromApi(invoice.line_items));
  const [lineError, setLineError] = useState<string | null>(null);

  const projectsQuery = useQuery({
    queryKey: ['projects/user-projects/'],
    queryFn: async () => {
      const response = await api.get<Record<string, unknown>[]>('/projects/user-projects/');
      return response.data.map(item => mapUserProject(item as Parameters<typeof mapUserProject>[0]));
    },
  });

  const clientsQuery = useQuery({
    queryKey: ['crm/studio-clients/'],
    queryFn: async () => {
      const response = await api.get<CrmContact[]>('/crm/studio-clients/');
      return response.data;
    },
  });

  const projectOptions = useMemo<FinancePickerOption[]>(
    () => (projectsQuery.data ?? []).map(project => ({ id: project.id, label: project.name })),
    [projectsQuery.data],
  );

  const clientOptions = useMemo<FinancePickerOption[]>(
    () => (clientsQuery.data ?? []).map(client => ({ id: client.id, label: contactDisplayName(client) })),
    [clientsQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validationError = validateDraftLineItems(lineItems);
      if (validationError) {
        throw new Error(validationError);
      }

      await api.patch(`/finance/invoices/${invoice.id}/`, {
        project: projectId,
        client: clientId,
        date: issueDate || null,
        due_date: dueDate || null,
        line_items: buildLineItemsPayload(lineItems),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['finance/invoices', String(invoice.id)] });
      await queryClient.invalidateQueries({ queryKey: ['finance/studio-finance'] });
      hapticSuccess();
      onSaved();
    },
    onError: error => {
      Alert.alert('Could not save invoice', getApiErrorMessage(error));
    },
  });

  const handleSave = () => {
    const validationError = validateDraftLineItems(lineItems);
    setLineError(validationError);
    if (validationError) return;
    saveMutation.mutate();
  };

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Edit draft" />

      <FinancePickerField
        label="Project"
        value={projectId}
        options={projectOptions}
        onChange={setProjectId}
        loading={projectsQuery.isLoading}
        optional
      />

      <FinancePickerField
        label="Client"
        value={clientId}
        options={clientOptions}
        onChange={setClientId}
        loading={clientsQuery.isLoading}
        optional
      />

      <DatePickerField label="Issue date" value={issueDate} onChange={setIssueDate} />
      <DatePickerField label="Due date" value={dueDate} onChange={setDueDate} minimumDate={issueDate ? new Date(`${issueDate}T12:00:00`) : undefined} />

      <SectionHeader title="Line items" />
      <DraftLineItemsForm
        items={lineItems}
        currency={invoice.currency ?? 'GBP'}
        onChange={setLineItems}
        error={lineError}
      />

      <Button
        label="Save draft"
        onPress={handleSave}
        loading={saveMutation.isPending}
        accessibilityLabel="Save invoice draft"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
