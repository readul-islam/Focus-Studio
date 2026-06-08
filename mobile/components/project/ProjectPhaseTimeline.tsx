import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { isPhaseCurrent } from '@/lib/project-detail';
import { formatDate } from '@/lib/format';
import type { ProjectPhase } from '@focuspilot/shared';

type ProjectPhaseTimelineProps = {
  phases: ProjectPhase[];
};

function phaseProgress(phase: ProjectPhase): number {
  return Math.round(phase.progress ?? 0);
}

export function ProjectPhaseTimeline({ phases }: ProjectPhaseTimelineProps) {
  if (phases.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No phases configured for this project yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {phases.map(phase => {
        const current = isPhaseCurrent(phase.start_date, phase.end_date);
        const progress = phaseProgress(phase);

        return (
          <View key={phase.id} style={[styles.phaseCard, current && styles.phaseCardCurrent]}>
            <View style={styles.phaseHeader}>
              <Text style={[styles.phaseName, current && styles.phaseNameCurrent]} numberOfLines={2}>
                {phase.name}
              </Text>
              <Text style={styles.phaseProgress}>{progress}%</Text>
            </View>
            <ProgressBar value={progress} color={current ? colors.clay : colors.brand} />
            {phase.start_date ? (
              <Text style={styles.phaseDate}>{formatDate(phase.start_date)}</Text>
            ) : (
              <Text style={styles.phaseDateMuted}>No start date</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  phaseCard: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  phaseCardCurrent: {
    borderColor: colors.clay,
    backgroundColor: '#fff7f3',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  phaseName: {
    flex: 1,
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
  },
  phaseNameCurrent: {
    color: colors.clay,
  },
  phaseProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  phaseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  phaseDateMuted: {
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
