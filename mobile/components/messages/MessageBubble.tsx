import { StyleSheet, Text, View } from 'react-native';
import type { ProjectMessage } from '@focuspilot/shared';
import { AvatarCircle } from '@/components/design-system';
import { colors, radius, spacing } from '@/constants/theme';
import { formatTimeAgo } from '@/lib/format';
import { stripHtml } from '@/lib/html';

export function MessageBubble({ message, userEmail }: { message: ProjectMessage; userEmail?: string }) {
  const sentByMe = message.is_sent || message.sender.toLowerCase().includes(userEmail?.toLowerCase() ?? '___');
  const label =
    message.sender_label ||
    (sentByMe ? 'You' : message.sender.split('<')[0]?.trim().replace(/^["']|["']$/g, '') || 'Unknown');
  const body = stripHtml(message.body);

  return (
    <View style={[styles.bubbleRow, sentByMe && styles.bubbleRowMine]}>
      {!sentByMe ? <AvatarCircle name={label} size={32} /> : null}
      <View style={[styles.bubble, sentByMe ? styles.bubbleMine : styles.bubbleTheirs]}>
        <View style={styles.bubbleHeader}>
          <Text style={styles.sender}>{label}</Text>
          <Text style={styles.time}>{formatTimeAgo(message.received_at)}</Text>
        </View>
        <Text style={styles.body}>{body || 'No message content'}</Text>
        {message.has_attachment ? (
          <Text style={styles.attachment}>Has attachments — open on web to view</Text>
        ) : null}
      </View>
      {sentByMe ? <AvatarCircle name={label} size={32} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  bubbleRowMine: {
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
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sender: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
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
