import { useMemo } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FilterChips, SectionHeader, StatusBadge } from '@/components/design-system';
import { Button } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-errors';
import { formatCurrency, formatDate } from '@/lib/format';
import { hapticSuccess } from '@/lib/haptics';
import {
  convertLeadToProject,
  fetchLead,
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  leadDisplayValue,
  leadStageStyle,
  updateLeadStage,
  type LeadStage,
} from '@/lib/leads';
import { openStudioWebPath } from '@/lib/web';

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currency = user?.studio?.default_currency ?? 'GBP';

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['crm/leads', id],
    queryFn: () => fetchLead(Number(id)),
    enabled: Boolean(id),
  });

  const stageOptions = useMemo(
    () => LEAD_STAGES.map(stage => ({ key: stage, label: LEAD_STAGE_LABELS[stage] })),
    [],
  );

  const stageMutation = useMutation({
    mutationFn: (stage: LeadStage) => updateLeadStage(Number(id), stage),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['crm/leads'] });
      await queryClient.invalidateQueries({ queryKey: ['crm/leads', id] });
      hapticSuccess();
      refetch();
    },
    onError: error => {
      Alert.alert('Could not update stage', getApiErrorMessage(error));
    },
  });

  const convertMutation = useMutation({
    mutationFn: () => convertLeadToProject(Number(id), data?.email ?? undefined),
    onSuccess: async project => {
      await queryClient.invalidateQueries({ queryKey: ['crm/leads'] });
      hapticSuccess();
      Alert.alert('Project created', 'This lead is now linked to a new project.', [
        { text: 'View project', onPress: () => router.push(`/project/${project.id}` as Href) },
        { text: 'OK' },
      ]);
      refetch();
    },
    onError: error => {
      Alert.alert('Could not create project', getApiErrorMessage(error));
    },
  });

  if (isLoading && !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading lead…</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Couldn't load this lead.</Text>
        <Button label="Try again" onPress={refetch} />
      </View>
    );
  }

  const stageStyle = leadStageStyle(data.stage);
  const value = leadDisplayValue(data);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Stack.Screen options={{ title: data.title }} />

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.heroTitle}>{data.title}</Text>
          <StatusBadge label={stageStyle.label} color={stageStyle.color} backgroundColor={stageStyle.backgroundColor} />
        </View>
        {data.full_name ? <Text style={styles.heroSubtitle}>{data.full_name}</Text> : null}
        {value > 0 ? (
          <Text style={styles.heroValue}>{formatCurrency(value, currency)}</Text>
        ) : null}
      </View>

      <SectionHeader title="Stage" subtitle="Move leads forward as they progress" />
      <FilterChips
        options={stageOptions}
        value={data.stage}
        onChange={stage => {
          if (stage !== data.stage) stageMutation.mutate(stage);
        }}
      />

      <SectionHeader title="Contact" />
      <View style={styles.card}>
        <Field label="Name" value={data.full_name} />
        <Field label="Email" value={data.email} />
        <Field label="Phone" value={data.phone} />
        <Field label="Source" value={data.source} />
        <Field label="Location" value={data.location} />
      </View>

      {(data.budget_range || data.project_type || data.estimated_value) && (
        <>
          <SectionHeader title="Qualification" />
          <View style={styles.card}>
            <Field label="Project type" value={data.project_type} />
            <Field label="Budget range" value={data.budget_range} />
            <Field
              label="Estimated value"
              value={data.estimated_value ? formatCurrency(Number(data.estimated_value), currency) : undefined}
            />
            <Field label="Proposal sent" value={data.proposal_sent_date ? formatDate(data.proposal_sent_date) : undefined} />
          </View>
        </>
      )}

      {data.notes ? (
        <>
          <SectionHeader title="Notes" />
          <View style={styles.card}>
            <Text style={styles.notes}>{data.notes}</Text>
          </View>
        </>
      ) : null}

      {data.stage === 'won' && !data.project_created ? (
        <Button
          label="Create project"
          onPress={() => convertMutation.mutate()}
          loading={convertMutation.isPending}
        />
      ) : null}

      {data.project_created && data.project ? (
        <Button
          label="View project"
          variant="secondary"
          onPress={() => router.push(`/project/${data.project}` as Href)}
        />
      ) : null}

      <Button
        label="Open in browser"
        variant="secondary"
        onPress={() => void openStudioWebPath('/crm/pipeline')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heroTitle: {
    ...typography.heading,
    fontSize: 22,
    flex: 1,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  heroValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    ...typography.label,
  },
  fieldValue: {
    fontSize: 15,
    color: colors.text,
  },
  notes: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
