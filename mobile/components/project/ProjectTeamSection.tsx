import { StyleSheet, Text, View } from 'react-native';
import { AvatarCircle } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { ProjectPresenceEntry } from '@/lib/collaboration';

type Member = { id: number; name: string };

export function ProjectTeamSection({
  members,
  presence,
  currentUserId,
}: {
  members: Member[];
  presence: ProjectPresenceEntry[];
  currentUserId?: number;
}) {
  const viewers = presence.filter(entry => entry.user?.id !== currentUserId);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Project team</Text>
      {members.length === 0 ? (
        <Text style={styles.empty}>No team members assigned yet.</Text>
      ) : (
        <View style={styles.memberList}>
          {members.map(member => (
            <View key={member.id} style={styles.memberRow}>
              <AvatarCircle name={member.name} size={36} />
              <Text style={styles.memberName} numberOfLines={1}>
                {member.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {viewers.length > 0 ? (
        <View style={styles.presenceRow}>
          <Text style={styles.presenceLabel}>Viewing now</Text>
          <View style={styles.presenceAvatars}>
            {viewers.slice(0, 5).map(entry => (
              <View key={entry.id} style={styles.presenceAvatar}>
                <AvatarCircle name={entry.user?.name ?? '?'} size={28} />
              </View>
            ))}
          </View>
          <Text style={styles.presenceText} numberOfLines={1}>
            {viewers.length === 1 ? viewers[0].user?.name : `${viewers.length} teammates`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subheading,
    marginBottom: spacing.sm,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
  },
  memberList: {
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  presenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  presenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  presenceAvatars: {
    flexDirection: 'row',
  },
  presenceAvatar: {
    marginLeft: -6,
  },
  presenceText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
});
