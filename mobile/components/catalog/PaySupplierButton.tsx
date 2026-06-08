import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { isCatalogProcurement, type ProcurementItem } from '@/lib/procurement';
import { openSupplierPaymentCheckout } from '@/lib/supplier-payments';

type PaySupplierButtonProps = {
  item: ProcurementItem;
  projectId: string;
};

export function PaySupplierButton({ item, projectId }: PaySupplierButtonProps) {
  const isCatalog = isCatalogProcurement(item);
  const isPaid = item.supplier_payment_status === 'paid';

  const payMutation = useMutation({
    mutationFn: () =>
      openSupplierPaymentCheckout({
        procurementId: item.id,
        projectId,
      }),
    onError: () => {
      Alert.alert(
        'Could not start payment',
        'The supplier may not have finished Stripe setup yet, or Stripe is not configured.',
      );
    },
  });

  if (!isCatalog) {
    return null;
  }

  if (isPaid) {
    return (
      <View style={styles.paidBadge}>
        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
        <Text style={styles.paidText}>Paid to supplier</Text>
      </View>
    );
  }

  return (
    <Button
      label="Pay supplier"
      variant="secondary"
      loading={payMutation.isPending}
      onPress={() => payMutation.mutate()}
      accessibilityLabel="Pay supplier for this catalog item"
    />
  );
}

const styles = StyleSheet.create({
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#ECFDF3',
  },
  paidText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
});
