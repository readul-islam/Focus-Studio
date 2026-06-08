import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectMessage } from '@focuspilot/shared';
import { TextArea } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { hapticSuccess } from '@/lib/haptics';
import { getApiErrorMessage, htmlToPlainText, plainTextToHtml, sendGmailEmail } from '@/lib/email-compose';
import { resolveReplySubject, resolveReplyToEmail } from '@/lib/gmail-reply';
import { api } from '@/lib/api';

type ReplyComposerProps = {
  threadId: string;
  messages: ProjectMessage[];
  userEmail?: string | null;
  onSent?: () => void;
};

export function ReplyComposer({ threadId, messages, userEmail, onSent }: ReplyComposerProps) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [expanded, setExpanded] = useState(false);

  const replySubject = resolveReplySubject(messages);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const toEmail = resolveReplyToEmail(messages, userEmail);
      if (!toEmail) {
        throw new Error('Could not determine who to reply to in this thread.');
      }

      return sendGmailEmail({
        to_email: toEmail,
        subject: replySubject,
        body: plainTextToHtml(body.trim()),
        thread_id: threadId,
      });
    },
    onSuccess: async () => {
      setBody('');
      setExpanded(false);
      hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['gmail/thread', threadId] });
      await queryClient.invalidateQueries({ queryKey: ['gmail/threads'] });
      onSent?.();
    },
    onError: (error: unknown) => {
      Alert.alert('Could not send reply', getApiErrorMessage(error, 'Check your connection and try again.'));
    },
  });

  const polishMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ body?: string }>('/gmail/polish-reply/', {
        body: plainTextToHtml(body.trim()),
        thread_id: threadId,
        subject: replySubject,
      });
      return response.data.body ?? '';
    },
    onSuccess: polished => {
      setBody(htmlToPlainText(polished));
      setExpanded(true);
    },
    onError: (error: unknown) => {
      Alert.alert('Could not polish reply', getApiErrorMessage(error, 'AI polish is unavailable right now.'));
    },
  });

  const canSend = body.trim().length > 0;
  const busy = sendMutation.isPending || polishMutation.isPending;

  if (!expanded && !body) {
    return (
      <Pressable
        style={({ pressed }) => [styles.collapsed, pressed && styles.collapsedPressed]}
        onPress={() => setExpanded(true)}
      >
        <Ionicons name="return-down-back-outline" size={18} color={colors.textMuted} />
        <Text style={styles.collapsedText}>Reply to this thread…</Text>
      </Pressable>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.composer}>
        <TextArea
          value={body}
          onChangeText={setBody}
          placeholder="Write your reply…"
          style={styles.input}
          autoFocus={expanded}
        />
        <View style={styles.toolbar}>
          <Pressable
            onPress={() => polishMutation.mutate()}
            disabled={!canSend || busy}
            style={({ pressed }) => [
              styles.toolButton,
              (!canSend || busy) && styles.toolButtonDisabled,
              pressed && canSend && styles.toolButtonPressed,
            ]}
          >
            {polishMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.clay} />
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={16} color={colors.clay} />
                <Text style={styles.polishText}>Polish</Text>
              </>
            )}
          </Pressable>

          <View style={styles.toolbarRight}>
            <Pressable
              onPress={() => {
                setBody('');
                setExpanded(false);
              }}
              disabled={busy}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.toolButtonPressed]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => sendMutation.mutate()}
              disabled={!canSend || busy}
              style={({ pressed }) => [
                styles.sendButton,
                (!canSend || busy) && styles.sendButtonDisabled,
                pressed && canSend && styles.sendButtonPressed,
              ]}
            >
              {sendMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="send" size={16} color={colors.primaryForeground} />
                  <Text style={styles.sendText}>Send</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  collapsedPressed: {
    opacity: 0.85,
  },
  collapsedText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  input: {
    minHeight: 96,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  toolButtonDisabled: {
    opacity: 0.45,
  },
  toolButtonPressed: {
    opacity: 0.75,
  },
  polishText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});
