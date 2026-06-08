import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { InboxThread } from '@focuspilot/shared';
import { AvatarCircle } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatTimeAgo } from '@/lib/format';
import { senderDisplayName } from '@/lib/inbox';

export function ThreadRow({ thread, onPress }: { thread: InboxThread; onPress: () => void }) {
  const sender = senderDisplayName(thread.sender);
  const projectName = thread.project?.name ?? thread.projects?.[0]?.name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, !thread.is_read && styles.rowUnread, pressed && styles.rowPressed]}
    >
      <AvatarCircle name={sender} size={40} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.sender, !thread.is_read && styles.senderUnread]} numberOfLines={1}>
            {sender}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(thread.received_at)}</Text>
        </View>
        <Text style={[styles.subject, !thread.is_read && styles.subjectUnread]} numberOfLines={1}>
          {thread.subject || '(No subject)'}
        </Text>
        <Text style={styles.snippet} numberOfLines={2}>
          {thread.snippet || 'No preview available'}
        </Text>
        <View style={styles.metaRow}>
          {projectName ? (
            <View style={styles.projectBadge}>
              <Ionicons name="folder-outline" size={11} color={colors.clay} />
              <Text style={styles.projectText} numberOfLines={1}>
                {projectName}
              </Text>
            </View>
          ) : null}
          {thread.has_attachment ? (
            <Ionicons name="attach-outline" size={14} color={colors.textMuted} style={styles.attachIcon} />
          ) : null}
        </View>
      </View>
      {!thread.is_read ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowUnread: {
    borderColor: '#fcd9cc',
    backgroundColor: '#fffaf8',
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  body: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sender: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  senderUnread: {
    color: colors.text,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  subject: {
    ...typography.subheading,
    fontSize: 15,
    marginTop: 2,
    color: colors.textSecondary,
  },
  subjectUnread: {
    color: colors.text,
  },
  snippet: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '80%',
    backgroundColor: '#fff4ed',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  projectText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.clay,
    flexShrink: 1,
  },
  attachIcon: {
    marginLeft: 'auto',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.clay,
    marginTop: 6,
  },
});
