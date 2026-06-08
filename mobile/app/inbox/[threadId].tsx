import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { InboxThread, ProjectMessage } from '@focuspilot/shared';
import { ErrorState, LoadingInline } from '@/components/design-system';
import { ReplyComposer } from '@/components/inbox/ReplyComposer';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useInbox } from '@/hooks/useInbox';
import { api } from '@/lib/api';

async function fetchThread(threadId: string): Promise<ProjectMessage[]> {
  const response = await api.get<ProjectMessage[]>(`/gmail/thread/${threadId}/`);
  return response.data;
}

export default function InboxThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const decodedThreadId = decodeURIComponent(String(threadId ?? ''));
  const { user } = useAuth();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['gmail/thread', decodedThreadId],
    queryFn: () => fetchThread(decodedThreadId),
    enabled: Boolean(decodedThreadId),
  });

  const subject = data?.[0]?.subject ?? 'Message thread';

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <LoadingInline />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loading}>
        <ErrorState title="Couldn't load message" onRetry={refetch} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Stack.Screen options={{ title: subject }} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        keyboardShouldPersistTaps="handled"
      >
        {(data ?? []).map(message => (
          <MessageBubble key={message.id} message={message} userEmail={user?.email} />
        ))}
      </ScrollView>
      <ThreadActions threadId={decodedThreadId} messages={data ?? []} />
      <ReplyComposer
        threadId={decodedThreadId}
        messages={data ?? []}
        userEmail={user?.email}
        onSent={refetch}
      />
    </KeyboardAvoidingView>
  );
}

function ThreadActions({
  threadId,
  messages,
}: {
  threadId: string;
  messages: ProjectMessage[];
}) {
  const { threads } = useInbox();
  const threadMeta = threads.find((t: InboxThread) => t.thread_id === threadId);
  const projectId = threadMeta?.project?.id ?? threadMeta?.projects?.[0]?.id;

  if (!projectId) {
    return (
      <View style={styles.actions}>
        <Text style={styles.actionsHint}>Link this thread to a project from the web app.</Text>
      </View>
    );
  }

  return (
    <View style={styles.actions}>
      <Pressable
        style={({ pressed }) => [styles.projectButton, pressed && styles.projectButtonPressed]}
        onPress={() => router.push(`/project/${projectId}` as Href)}
      >
        <Ionicons name="folder-outline" size={16} color={colors.clay} />
        <Text style={styles.projectButtonText}>
          {threadMeta?.project?.name ?? threadMeta?.projects?.[0]?.name ?? 'View project'}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </Pressable>
      {messages.length > 1 ? (
        <Text style={styles.actionsHint}>{messages.length} messages in this thread</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff4ed',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#fcd9cc',
    padding: spacing.md,
  },
  projectButtonPressed: {
    opacity: 0.85,
  },
  projectButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  actionsHint: {
    ...typography.caption,
    textAlign: 'center',
  },
});
