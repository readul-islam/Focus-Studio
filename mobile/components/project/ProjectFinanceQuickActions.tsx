import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { createDraftInvoice, createDraftPurchaseOrder } from '@/lib/finance-create';
import { getApiErrorMessage } from '@/lib/api-errors';
import { hapticSuccess } from '@/lib/haptics';

export function ProjectFinanceQuickActions({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const projectNumericId = Number(projectId);

  const invoiceMutation = useMutation({
    mutationFn: () => createDraftInvoice(user!, projectNumericId),
    onSuccess: async id => {
      await queryClient.invalidateQueries({ queryKey: ['finance/project-finance', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['finance/studio-finance'] });
      hapticSuccess();
      router.push(`/finance/invoice/${id}` as Href);
    },
    onError: error => {
      Alert.alert('Could not create invoice', getApiErrorMessage(error));
    },
  });

  const poMutation = useMutation({
    mutationFn: () => createDraftPurchaseOrder(user!, projectNumericId),
    onSuccess: async id => {
      await queryClient.invalidateQueries({ queryKey: ['finance/project-finance', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['finance/studio-finance'] });
      hapticSuccess();
      router.push(`/finance/purchase-order/${id}` as Href);
    },
    onError: error => {
      Alert.alert('Could not create expense', getApiErrorMessage(error));
    },
  });

  const busy = invoiceMutation.isPending || poMutation.isPending;

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        onPress={() => invoiceMutation.mutate()}
        disabled={busy || !user?.studio?.id}
        accessibilityRole="button"
        accessibilityLabel="Create project invoice"
      >
        <Ionicons name="document-text-outline" size={18} color={colors.primary} />
        <Text style={styles.actionText}>New invoice</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        onPress={() => poMutation.mutate()}
        disabled={busy || !user?.studio?.id}
        accessibilityRole="button"
        accessibilityLabel="Create project expense"
      >
        <Ionicons name="receipt-outline" size={18} color={colors.clay} />
        <Text style={styles.actionText}>New expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  actionPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
});
