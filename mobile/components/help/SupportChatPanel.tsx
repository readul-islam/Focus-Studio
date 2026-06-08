import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TextArea } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { getApiErrorMessage } from '@/lib/api-errors';
import {
  clearSupportConversation,
  fetchSupportConversation,
  sendSupportMessage,
  type SupportMessage,
} from '@/lib/help-support';
import { hapticSuccess } from '@/lib/haptics';

function MessageBubble({ message }: { message: SupportMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{message.content}</Text>
      </View>
    </View>
  );
}

export function SupportChatPanel() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const conversationQuery = useQuery({
    queryKey: ['help/support/conversation'],
    queryFn: fetchSupportConversation,
  });

  const messages = conversationQuery.data?.messages ?? [];
  const conversationId = conversationQuery.data?.conversation_id ?? null;

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendSupportMessage(message, conversationId),
    onSuccess: async () => {
      setDraft('');
      hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['help/support/conversation'] });
    },
    onError: error => {
      Alert.alert('Could not send message', getApiErrorMessage(error));
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => clearSupportConversation(conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['help/support/conversation'] });
    },
  });

  const handleSend = () => {
    const message = draft.trim();
    if (!message || sendMutation.isPending) return;
    sendMutation.mutate(message);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI support</Text>
        {messages.length > 0 ? (
          <Pressable onPress={() => clearMutation.mutate()} hitSlop={8}>
            <Text style={styles.clearLink}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          conversationQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Ask anything</Text>
              <Text style={styles.emptyText}>
                Get answers about projects, finance, CRM, permissions, and mobile features.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

      <View style={styles.composer}>
        <TextArea
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a question…"
          style={styles.input}
          editable={!sendMutation.isPending}
        />
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim() || sendMutation.isPending}
          style={({ pressed }) => [
            styles.sendButton,
            (!draft.trim() || sendMutation.isPending) && styles.sendButtonDisabled,
            pressed && draft.trim() && !sendMutation.isPending && styles.sendButtonPressed,
          ]}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} size="small" />
          ) : (
            <Text style={styles.sendLabel}>Send</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.subheading,
  },
  clearLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.subheading,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bubbleRow: {
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  bubbleRowUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bubbleTextUser: {
    color: colors.primaryForeground,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 64,
    alignItems: 'center',
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendLabel: {
    color: colors.primaryForeground,
    fontWeight: '700',
    fontSize: 14,
  },
});
