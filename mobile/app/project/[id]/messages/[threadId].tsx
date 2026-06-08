import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { ProjectMessage } from '@focuspilot/shared';
import { ErrorState, LoadingInline } from '@/components/design-system';
import { ReplyComposer } from '@/components/inbox/ReplyComposer';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

async function fetchThread(threadId: string): Promise<ProjectMessage[]> {
  const response = await api.get<ProjectMessage[]>(`/gmail/thread/${threadId}/`);
  return response.data;
}

export default function ProjectThreadScreen() {
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
        <ErrorState title="Couldn't load thread" onRetry={refetch} />
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
      <ReplyComposer
        threadId={decodedThreadId}
        messages={data ?? []}
        userEmail={user?.email}
        onSent={refetch}
      />
    </KeyboardAvoidingView>
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
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});
