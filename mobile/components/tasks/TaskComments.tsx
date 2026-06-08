import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskComment } from '@focuspilot/shared';
import { AvatarCircle } from '@/components/design-system';
import { Button, TextArea } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { studioUserLabel } from '@/lib/task-form';
import { formatTimeAgo } from '@/lib/format';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { api } from '@/lib/api';

type TaskCommentsProps = {
  taskId: number;
  projectId?: number | null;
  comments: TaskComment[];
};

export function TaskComments({ taskId, projectId, comments }: TaskCommentsProps) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const mutation = useMutation({
    mutationFn: async (commentText: string) => {
      const created = await api.post<{ id: number }>('/comment/comments/', { text: commentText });
      const currentIds = comments.map(comment => comment.id);
      await api.patch(`/task/tasks/${taskId}/`, {
        comments: [...currentIds, created.data.id],
      });
      return created.data;
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['task/tasks', String(taskId)] });
      hapticSuccess();
    },
    onError: () => Alert.alert('Could not post comment', 'Please try again.'),
  });

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    hapticLight();
    mutation.mutate(trimmed);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Comments</Text>

      {comments.length === 0 ? (
        <Text style={styles.empty}>No comments yet. Start the conversation.</Text>
      ) : (
        comments.map(comment => {
          const author = comment.user
            ? studioUserLabel({
                name: comment.user.name,
                first_name: comment.user.first_name,
                email: comment.user.email ?? 'User',
              })
            : 'Team member';
          return (
            <View key={comment.id} style={styles.comment}>
              <AvatarCircle name={author} size={32} />
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <Text style={styles.author}>{author}</Text>
                  <Text style={styles.time}>{formatTimeAgo(comment.created_at)}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          );
        })
      )}

      <TextArea
        value={text}
        onChangeText={setText}
        placeholder="Write a comment…"
        style={styles.input}
      />
      <Button
        label={mutation.isPending ? 'Posting…' : 'Post comment'}
        onPress={handleSubmit}
        loading={mutation.isPending}
        disabled={!text.trim()}
      />
      {projectId ? (
        <Text style={styles.hint}>@mentions notify teammates on the web app.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    ...typography.label,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
  },
  comment: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  input: {
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
