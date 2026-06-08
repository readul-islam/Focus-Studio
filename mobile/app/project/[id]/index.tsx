import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  KpiCard,
  ListCard,
  SectionHeader,
} from '@/components/design-system';
import { ProjectPhaseTimeline } from '@/components/project/ProjectPhaseTimeline';
import { ProjectProcurementCard } from '@/components/project/ProjectProcurementCard';
import { Card } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { formatDate, formatTimeAgo } from '@/lib/format';
import { formatProjectBudget } from '@/lib/projects';

export default function ProjectOverviewTab() {
  const { hubProject, overview, phases, projectId, isRefetching, refetch } = useProjectHub();
  const tasks = overview?.tasks;
  const budget = overview?.budget_utilization;
  const budgetLabel = formatProjectBudget(budget?.total_budget, hubProject?.currency);
  const spentLabel = formatProjectBudget(budget?.total_po_amount, hubProject?.currency);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.quickLinks}>
        {[
          { label: 'Tasks', icon: 'checkbox-outline' as const, href: `/project/${projectId}/tasks` },
          { label: 'Messages', icon: 'mail-outline' as const, href: `/project/${projectId}/messages` },
          { label: 'Files', icon: 'folder-outline' as const, href: `/project/${projectId}/files` },
        ].map(link => (
          <Pressable
            key={link.label}
            style={({ pressed }) => [styles.quickLink, pressed && styles.quickLinkPressed]}
            onPress={() => router.push(link.href as Href)}
          >
            <Ionicons name={link.icon} size={18} color={colors.primary} />
            <Text style={styles.quickLinkText}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      {overview ? (
        <>
          <SectionHeader title="At a glance" />
          <View style={styles.kpiRow}>
            <KpiCard
              label="Tasks done"
              value={`${tasks?.completed ?? 0}/${tasks?.total ?? 0}`}
              subtitle={
                (tasks?.remaining ?? 0) > 0
                  ? `${tasks?.remaining} remaining`
                  : 'All tasks complete'
              }
              accent={colors.success}
            />
            <KpiCard
              label="In progress"
              value={tasks?.in_progress ?? 0}
              subtitle={`${Math.round(tasks?.completion_percentage ?? 0)}% complete`}
              accent={colors.brand}
            />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard
              label="Budget"
              value={budgetLabel ?? '—'}
              subtitle={
                budget?.percentage != null
                  ? `${Math.round(budget.percentage)}% utilized${spentLabel ? ` · ${spentLabel} spent` : ''}`
                  : undefined
              }
              accent={colors.clay}
            />
            <KpiCard
              label="POs delayed"
              value={overview.pos_delayed?.count ?? 0}
              subtitle={
                (overview.procurement_status?.pos_needing_approval ?? 0) > 0
                  ? `${overview.procurement_status?.pos_needing_approval} need approval`
                  : 'Procurement'
              }
              accent={colors.danger}
            />
          </View>

          <SectionHeader title="Procurement" />
          <ProjectProcurementCard overview={overview} projectId={projectId} />
        </>
      ) : null}

      <SectionHeader title="Phases" />
      <ProjectPhaseTimeline phases={phases} />

      <SectionHeader
        title="Recent activity"
        actionLabel="Tasks"
        onAction={() => router.push(`/project/${projectId}/tasks` as Href)}
      />
      {(overview?.recent_activity ?? []).length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyMessage}>Project updates will show up as work progresses.</Text>
        </View>
      ) : (
        overview?.recent_activity?.slice(0, 5).map((item, index) => (
          <ListCard
            key={`${item.type}-${item.name}-${index}`}
            title={item.name}
            subtitle={item.type}
            meta={formatTimeAgo(item.updated_at)}
            showChevron={false}
          />
        ))
      )}

      <SectionHeader
        title="Latest files"
        actionLabel="Browse"
        onAction={() => router.push(`/project/${projectId}/files` as Href)}
      />
      {(overview?.latest_files ?? []).length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="folder-open-outline" size={24} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No files yet</Text>
          <Text style={styles.emptyMessage}>Files uploaded to this project appear here.</Text>
        </View>
      ) : (
        overview?.latest_files?.map(file => (
          <Pressable
            key={file.id}
            style={({ pressed }) => [styles.fileRow, pressed && styles.fileRowPressed]}
            onPress={() => router.push(`/project/${projectId}/files` as Href)}
          >
            <View style={styles.fileIcon}>
              <Ionicons
                name={file.type === 'FOLDER' ? 'folder-outline' : 'document-outline'}
                size={18}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))
      )}

      <SectionHeader title="Timeline" />
      <Card>
        {hubProject?.startDate ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Start</Text>
            <Text style={styles.detailValue}>{formatDate(hubProject.startDate)}</Text>
          </View>
        ) : null}
        {hubProject?.endDate ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>End</Text>
            <Text style={styles.detailValue}>{formatDate(hubProject.endDate)}</Text>
          </View>
        ) : null}
        {!hubProject?.startDate && !hubProject?.endDate ? (
          <Text style={styles.emptyMeta}>No dates set for this project.</Text>
        ) : null}
      </Card>

      {hubProject?.description ? (
        <>
          <SectionHeader title="About" />
          <Card>
            <Text style={styles.description}>{hubProject.description}</Text>
          </Card>
        </>
      ) : null}
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
  quickLinks: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickLink: {
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
  quickLinkPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  quickLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  emptyMessage: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  fileRowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailKey: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  emptyMeta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
