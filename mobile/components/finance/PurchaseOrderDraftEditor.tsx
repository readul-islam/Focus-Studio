import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrmContact, FinancePurchaseOrder } from '@focuspilot/shared';
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

type PurchaseOrderDraftEditorProps = {
  purchaseOrder: FinancePurchaseOrder;
  onSaved: () => void;
};

export function PurchaseOrderDraftEditor({ purchaseOrder, onSaved }: PurchaseOrderDraftEditorProps) {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<number | null>(purchaseOrder.project?.id ?? null);
  const [supplierId, setSupplierId] = useState<number | null>(purchaseOrder.supplier?.id ?? null);
  const [issueDate, setIssueDate] = useState(purchaseOrder.date ?? '');
  const [dueDate, setDueDate] = useState(purchaseOrder.due_date ?? '');
  const [lineItems, setLineItems] = useState<DraftLineItem[]>(() => lineItemsFromApi(purchaseOrder.line_items));
  const [lineError, setLineError] = useState<string | null>(null);

  const projectsQuery = useQuery({
    queryKey: ['projects/user-projects/'],
    queryFn: async () => {
      const response = await api.get<Record<string, unknown>[]>('/projects/user-projects/');
      return response.data.map(item => mapUserProject(item as Parameters<typeof mapUserProject>[0]));
    },
  });

  const suppliersQuery = useQuery({
    queryKey: ['crm/studio-suppliers/'],
    queryFn: async () => {
      const response = await api.get<CrmContact[]>('/crm/studio-suppliers/');
      return response.data;
    },
  });

  const projectOptions = useMemo<FinancePickerOption[]>(
    () => (projectsQuery.data ?? []).map(project => ({ id: project.id, label: project.name })),
    [projectsQuery.data],
  );

  const supplierOptions = useMemo<FinancePickerOption[]>(
    () => (suppliersQuery.data ?? []).map(supplier => ({ id: supplier.id, label: contactDisplayName(supplier) })),
    [suppliersQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validationError = validateDraftLineItems(lineItems);
      if (validationError) {
        throw new Error(validationError);
      }

      await api.patch(`/finance/purchase-orders/${purchaseOrder.id}/`, {
        project: projectId,
        supplier: supplierId,
        date: issueDate || null,
        due_date: dueDate || null,
        line_items: buildLineItemsPayload(lineItems),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['finance/purchase-orders', String(purchaseOrder.id)] });
      await queryClient.invalidateQueries({ queryKey: ['finance/studio-finance'] });
      hapticSuccess();
      onSaved();
    },
    onError: error => {
      Alert.alert('Could not save purchase order', getApiErrorMessage(error));
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
        label="Supplier"
        value={supplierId}
        options={supplierOptions}
        onChange={setSupplierId}
        loading={suppliersQuery.isLoading}
        optional
      />

      <DatePickerField label="Issue date" value={issueDate} onChange={setIssueDate} />
      <DatePickerField label="Due date" value={dueDate} onChange={setDueDate} minimumDate={issueDate ? new Date(`${issueDate}T12:00:00`) : undefined} />

      <SectionHeader title="Line items" />
      <DraftLineItemsForm
        items={lineItems}
        currency={purchaseOrder.currency ?? 'GBP'}
        onChange={setLineItems}
        error={lineError}
      />

      <Button
        label="Save draft"
        onPress={handleSave}
        loading={saveMutation.isPending}
        accessibilityLabel="Save purchase order draft"
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
