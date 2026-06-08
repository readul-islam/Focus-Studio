import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarCircle, ProgressBar, StatusBadge } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { useProjectBannerUpload } from '@/hooks/useProjectBannerUpload';
import { projectDateRange, projectStatusLabel } from '@/lib/projects';
import { projectLocationLabel } from '@/lib/project-detail';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  RS: 'home-outline',
  CM: 'business-outline',
  HS: 'bed-outline',
};

export function ProjectHubHeader() {
  const { hubProject, progress, projectId, refetch } = useProjectHub();
  const { uploading, previewUri, promptBannerChange } = useProjectBannerUpload(projectId, refetch);

  if (!hubProject) {
    return null;
  }

  const typeIcon = TYPE_ICONS[hubProject.projectTypeCode ?? ''] ?? 'folder-outline';
  const location = projectLocationLabel(hubProject);
  const dates = projectDateRange(hubProject.startDate, hubProject.endDate);
  const statusLabel = projectStatusLabel(hubProject.status);
  const bannerUri = previewUri ?? hubProject.bannerUrl;

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        {bannerUri ? (
          <Image source={{ uri: bannerUri }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroFallback}>
            <Ionicons name={typeIcon} size={40} color={colors.clay} />
          </View>
        )}

        <View style={styles.heroShadeTop} />
        <View style={styles.heroShadeBottom} />

        <Pressable
          onPress={promptBannerChange}
          disabled={uploading}
          style={({ pressed }) => [styles.bannerButton, pressed && styles.bannerButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Change project banner photo"
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Ionicons name="camera-outline" size={18} color={colors.white} />
          )}
        </Pressable>

        {hubProject.nextPhase ? (
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText} numberOfLines={1}>
              {hubProject.nextPhase}
            </Text>
          </View>
        ) : null}

        <View style={styles.heroContent}>
          <View style={styles.titleRow}>
            <StatusBadge
              label={statusLabel}
              color={colors.white}
              backgroundColor="rgba(255,255,255,0.18)"
            />
            {hubProject.code ? <Text style={styles.code}>{hubProject.code}</Text> : null}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {hubProject.name}
          </Text>

          <View style={styles.metaRow}>
            {hubProject.clientName ? (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.92)" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {hubProject.clientName}
                </Text>
              </View>
            ) : null}
            {location ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.92)" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall progress</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <ProgressBar value={progress} color={colors.success} />
        {dates ? <Text style={styles.dates}>{dates}</Text> : null}

        {hubProject.assignees.length > 0 ? (
          <View style={styles.teamRow}>
            {hubProject.assignees.slice(0, 4).map((member, index) => (
              <View key={member.id} style={[styles.avatarWrap, index > 0 && styles.avatarOverlap]}>
                <AvatarCircle name={member.name} size={30} />
              </View>
            ))}
            {hubProject.assignees.length > 4 ? (
              <Text style={styles.moreTeam}>+{hubProject.assignees.length - 4}</Text>
            ) : null}
            <Text style={styles.teamLead} numberOfLines={1}>
              {hubProject.assignees[0]?.name}
              {hubProject.assignees.length > 1 ? ` +${hubProject.assignees.length - 1}` : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  hero: {
    height: 196,
    backgroundColor: colors.brand,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
  },
  heroShadeTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  heroShadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '72%',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  bannerButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerButtonPressed: {
    opacity: 0.85,
  },
  phaseBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    maxWidth: '52%',
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
  heroContent: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.4,
  },
  title: {
    ...typography.heading,
    fontSize: 24,
    color: colors.white,
    lineHeight: 28,
    textTransform: 'capitalize',
  },
  metaRow: {
    marginTop: spacing.sm,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '500',
  },
  statsCard: {
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  dates: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius.full,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  moreTeam: {
    marginLeft: spacing.xs,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  teamLead: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
