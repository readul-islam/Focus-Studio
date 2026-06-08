import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarCircle } from '@/components/design-system';
import { colors, radius, spacing } from '@/constants/theme';
import type { TeamMessage } from '@/lib/collaboration';
import { formatTimeAgo } from '@/lib/format';

export function TeamMessageBubble({
  message,
  currentUserId,
}: {
  message: TeamMessage;
  currentUserId?: number;
}) {
  const sentByMe = message.user?.id === currentUserId;
  const label = sentByMe ? 'You' : message.user?.name || 'Unknown';
  const body = message.content.trim();

  return (
    <View style={[styles.row, sentByMe && styles.rowMine]}>
      {!sentByMe ? <AvatarCircle name={label} size={32} /> : null}
      <View style={[styles.bubble, sentByMe ? styles.bubbleMine : styles.bubbleTheirs]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {message.is_pinned ? (
              <Ionicons name="pin" size={12} color={colors.clay} style={styles.pinIcon} />
            ) : null}
            <Text style={styles.sender}>{label}</Text>
          </View>
          <Text style={styles.time}>{formatTimeAgo(message.created_at)}</Text>
        </View>
        <Text style={styles.body}>{body || '—'}</Text>
        {(message.attachments?.length ?? 0) > 0 ? (
          <Text style={styles.attachment}>
            {message.attachments!.length} attachment{message.attachments!.length === 1 ? '' : 's'} — open on web to view
          </Text>
        ) : null}
      </View>
      {sentByMe ? <AvatarCircle name={label} size={32} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    flex: 1,
    maxWidth: '82%',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  bubbleMine: {
    backgroundColor: '#f3f4f6',
    borderColor: colors.border,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  pinIcon: {
    marginRight: 4,
  },
  sender: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  attachment: {
    fontSize: 12,
    color: colors.clay,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
});
