import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';
import { calcDraftTotal, createEmptyLineItem, type DraftLineItem } from '@/lib/finance-draft';

type DraftLineItemsFormProps = {
  items: DraftLineItem[];
  currency: string;
  onChange: (items: DraftLineItem[]) => void;
  error?: string | null;
};

export function DraftLineItemsForm({ items, currency, onChange, error }: DraftLineItemsFormProps) {
  const total = calcDraftTotal(items);

  const updateItem = (key: string, patch: Partial<DraftLineItem>) => {
    onChange(items.map(item => (item.key === key ? { ...item, ...patch } : item)));
  };

  const removeItem = (key: string) => {
    const next = items.filter(item => item.key !== key);
    onChange(next.length > 0 ? next : [createEmptyLineItem()]);
  };

  const addItem = () => {
    onChange([...items, createEmptyLineItem()]);
  };

  return (
    <View style={styles.wrap}>
      {items.map((item, index) => (
        <View key={item.key} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Item {index + 1}</Text>
            {items.length > 1 ? (
              <Pressable
                onPress={() => removeItem(item.key)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove line item ${index + 1}`}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>

          <Input
            value={item.description}
            onChangeText={description => updateItem(item.key, { description })}
            placeholder="Description"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Qty</Text>
              <Input
                value={item.quantity}
                onChangeText={quantity => updateItem(item.key, { quantity })}
                keyboardType="number-pad"
                placeholder="1"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Unit price</Text>
              <Input
                value={item.unitPrice}
                onChangeText={unitPrice => updateItem(item.key, { unitPrice })}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>
          </View>
        </View>
      ))}

      <Pressable
        onPress={addItem}
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add line item"
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.addButtonText}>Add line item</Text>
      </Pressable>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Estimated total</Text>
        <Text style={styles.totalValue}>{formatCurrency(total, currency)}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.subheading,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: spacing.sm,
  },
  addButtonPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
  },
});
