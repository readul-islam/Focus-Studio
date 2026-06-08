import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { ProjectOverviewData } from '@focuspilot/shared';

type ProjectProcurementCardProps = {
  overview: ProjectOverviewData;
  projectId?: string;
};

export function ProjectProcurementCard({ overview, projectId }: ProjectProcurementCardProps) {
  const actionRequired = overview.procurement_status?.action_required ?? false;
  const delayed = overview.pos_delayed?.count ?? 0;
  const needsApproval = overview.procurement_status?.pos_needing_approval ?? 0;

  const content = (
    <>
      <View style={styles.header}>
        <Ionicons
          name={actionRequired ? 'alert-circle-outline' : 'checkmark-circle-outline'}
          size={20}
          color={actionRequired ? colors.danger : colors.success}
        />
        <Text style={[styles.title, actionRequired ? styles.titleAlert : styles.titleOk]}>
          {actionRequired ? 'Procurement needs attention' : 'Procurement on track'}
        </Text>
      </View>

      {delayed > 0 ? (
        <Text style={styles.detail}>
          {delayed} purchase order{delayed === 1 ? '' : 's'} overdue
        </Text>
      ) : null}

      {needsApproval > 0 ? (
        <Text style={styles.detail}>
          {needsApproval} awaiting approval
        </Text>
      ) : null}

      {!actionRequired && delayed === 0 && needsApproval === 0 ? (
        <Text style={styles.detailMuted}>No delayed POs or pending approvals.</Text>
      ) : null}

      {projectId ? (
        <Text style={styles.viewAll}>View all procurement items</Text>
      ) : null}
    </>
  );

  if (!projectId) {
    return <View style={[styles.card, actionRequired ? styles.cardAlert : styles.cardOk]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={() => router.push(`/project/${projectId}/procurement` as Href)}
      style={({ pressed }) => [
        styles.card,
        actionRequired ? styles.cardAlert : styles.cardOk,
        pressed && styles.cardPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardAlert: {
    backgroundColor: colors.dangerSurface,
    borderColor: '#fecaca',
  },
  cardOk: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  titleAlert: {
    color: colors.danger,
  },
  titleOk: {
    color: colors.success,
  },
  detail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 28,
  },
  detailMuted: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 28,
  },
  cardPressed: {
    opacity: 0.92,
  },
  viewAll: {
    ...typography.caption,
    color: colors.brand,
    fontWeight: '600',
    marginLeft: 28,
    marginTop: spacing.xs,
  },
});
