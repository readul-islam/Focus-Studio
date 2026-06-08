import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarCircle, ProgressBar } from '@/components/design-system';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import {
  formatProjectBudget,
  projectDateRange,
  type UserProject,
} from '@/lib/projects';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  RS: 'home-outline',
  CM: 'business-outline',
  HS: 'bed-outline',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  AC: { bg: '#ecfdf5', text: '#15803d', border: '#bbf7d0' },
  COM: { bg: colors.surfaceElevated, text: colors.textSecondary, border: colors.border },
  ARC: { bg: '#f3f4f6', text: colors.textMuted, border: colors.border },
  WON: { bg: '#fff7ed', text: colors.clay, border: '#fed7aa' },
};

type ProjectCardProps = {
  project: UserProject;
  onPress: () => void;
};

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const progress = Math.max(0, Math.min(100, project.progress));
  const budgetLabel = formatProjectBudget(project.budget, project.currency);
  const dates = projectDateRange(project.startDate, project.endDate);
  const statusStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.AC;
  const typeIcon = TYPE_ICONS[project.projectTypeCode ?? ''] ?? 'folder-outline';
  const subtitle = [project.code, project.clientName].filter(Boolean).join(' · ');
  const leadAssignee = project.assignees[0];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.hero}>
        {project.bannerUrl ? (
          <Image source={{ uri: project.bannerUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroFallback}>
            <Ionicons name={typeIcon} size={36} color={colors.clayCurve} />
          </View>
        )}

        <View style={styles.heroOverlay} />

        {project.nextPhase ? (
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText} numberOfLines={1}>
              {project.nextPhase}
            </Text>
          </View>
        ) : null}

        <View style={[styles.typeBadge, { borderColor: statusStyle.border, backgroundColor: statusStyle.bg }]}>
          <Ionicons name={typeIcon} size={12} color={statusStyle.text} />
          <Text style={[styles.typeBadgeText, { color: statusStyle.text }]} numberOfLines={1}>
            {project.projectType}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {project.name}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            {project.location ? (
              <Text style={styles.location} numberOfLines={1}>
                {project.location}
              </Text>
            ) : dates ? (
              <Text style={styles.location} numberOfLines={1}>
                {dates}
              </Text>
            ) : null}
          </View>

          {budgetLabel ? (
            <View style={styles.budgetBlock}>
              <Text style={styles.budgetValue}>{budgetLabel}</Text>
              {project.spent != null && project.spent > 0 ? (
                <Text style={styles.budgetSpent}>
                  {formatProjectBudget(project.spent, project.currency)} spent
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <ProgressBar value={progress} color={colors.success} />
        </View>

        <View style={styles.footer}>
          <View style={styles.teamRow}>
            {project.assignees.slice(0, 3).map((member, index) => (
              <View
                key={member.id}
                style={[styles.avatarWrap, index > 0 && styles.avatarOverlap]}
              >
                <AvatarCircle name={member.name} size={28} />
              </View>
            ))}
            {project.assignees.length > 3 ? (
              <View style={[styles.moreAvatars, styles.avatarOverlap]}>
                <Text style={styles.moreAvatarsText}>+{project.assignees.length - 3}</Text>
              </View>
            ) : null}
            {leadAssignee ? (
              <Text style={styles.leadName} numberOfLines={1}>
                {leadAssignee.name}
              </Text>
            ) : (
              <Text style={styles.leadName}>No team yet</Text>
            )}
          </View>

          <View style={styles.cta}>
            <Text style={styles.ctaText}>Open</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primaryForeground} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  hero: {
    height: 156,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  phaseBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    maxWidth: '58%',
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  phaseBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    maxWidth: '42%',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.subheading,
    fontSize: 17,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  budgetBlock: {
    alignItems: 'flex-end',
    maxWidth: '40%',
  },
  budgetValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  budgetSpent: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
  teamRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius.full,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  moreAvatars: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAvatarsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  leadName: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});
