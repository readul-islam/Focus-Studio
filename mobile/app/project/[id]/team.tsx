import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ErrorState, LoadingInline, SectionHeader } from '@/components/design-system';
import { ProjectTeamSection } from '@/components/project/ProjectTeamSection';
import { TeamChatComposer } from '@/components/project/TeamChatComposer';
import { TeamMessageBubble } from '@/components/project/TeamMessageBubble';
import { EmptyState } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useProjectHub } from '@/context/ProjectHubContext';
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration';

export default function ProjectTeamTab() {
  const { projectId, hubProject } = useProjectHub();
  const { user } = useAuth();
  const {
    messages,
    messagesLoading,
    messagesError,
    presence,
    sendMessage,
    isSending,
    isRefetching,
    refetch,
  } = useProjectCollaboration(projectId);

  if (messagesError) {
    return (
      <View style={styles.centered}>
        <ErrorState title="Couldn't load team chat" onRetry={refetch} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        keyboardShouldPersistTaps="handled"
      >
        <ProjectTeamSection
          members={hubProject?.assignees ?? []}
          presence={presence}
          currentUserId={user?.id}
        />

        <SectionHeader title="Team chat" subtitle="Updates every few seconds" />

        {messagesLoading && messages.length === 0 ? <LoadingInline /> : null}

        {!messagesLoading && messages.length === 0 ? (
          <EmptyState
            title="Start the conversation"
            message="Share updates with your project team. Messages sync with the web app."
          />
        ) : null}

        {messages.map(message => (
          <TeamMessageBubble key={message.id} message={message} currentUserId={user?.id} />
        ))}

        <Text style={styles.hint}>File attachments and @mentions are available on the web app.</Text>
      </ScrollView>

      <TeamChatComposer onSend={sendMessage} sending={isSending} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
