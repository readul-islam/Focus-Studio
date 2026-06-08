import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TaskDetail } from '@focuspilot/shared';
import {
  ErrorState,
  FilterChips,
  LoadingInline,
  ProgressBar,
  ScreenCanvas,
  StatusBadge,
} from '@/components/design-system';
import { StackHeaderActions } from '@/components/navigation/StackHeaderActions';
import { TaskAttachments } from '@/components/tasks/TaskAttachments';
import { TaskComments } from '@/components/tasks/TaskComments';
import { Card } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { routes } from '@/lib/routes';
import { studioUserLabel } from '@/lib/task-form';
import {
  TASK_STATUS_OPTIONS,
  priorityColor,
  priorityLabel,
  taskStatusLabel,
  taskStatusStyle,
} from '@/lib/task-utils';
import { api } from '@/lib/api';
import { useTimeTracker } from '@/context/TimeTrackerContext';

async function fetchTask(id: string): Promise<TaskDetail> {
  const response = await api.get<TaskDetail>(`/task/tasks/${id}/`);
  return response.data;
}

async function moveTask(id: string, status: string) {
  const response = await api.patch(`/task/tasks/${id}/move/`, { status });
  return response.data;
}

async function toggleSubtask(subtaskId: number, isCompleted: boolean) {
  const response = await api.patch(`/task/subtasks/${subtaskId}/`, { is_completed: isCompleted });
  return response.data;
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { activeLog, clockIn, clockOut, isClockingIn, isClockingOut } = useTimeTracker();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['task/tasks', id],
    queryFn: () => fetchTask(String(id)),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => moveTask(String(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task/tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      queryClient.invalidateQueries({ queryKey: ['user/dashboard/'] });
    },
  });

  const subtaskMutation = useMutation({
    mutationFn: ({ subtaskId, isCompleted }: { subtaskId: number; isCompleted: boolean }) =>
      toggleSubtask(subtaskId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task/tasks', id] });
      hapticLight();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (state: 'AC' | 'ARC') => api.patch(`/task/tasks/${id}/`, { state }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task/tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      hapticSuccess();
    },
    onError: () => Alert.alert('Could not update task', 'Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/task/tasks/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      queryClient.invalidateQueries({ queryKey: ['user/dashboard/'] });
      hapticSuccess();
      router.back();
    },
    onError: () => Alert.alert('Could not delete task', 'Please try again.'),
  });

  if (isLoading) {
    return (
      <ScreenCanvas>
        <LoadingInline />
      </ScreenCanvas>
    );
  }

  if (isError || !data) {
    return (
      <ScreenCanvas>
        <ErrorState title="Couldn't load task" onRetry={refetch} />
      </ScreenCanvas>
    );
  }

  const projectName = data.project?.project_name ?? data.project?.name ?? data.project_name;
  const phaseName = typeof data.phase === 'object' && data.phase?.name ? data.phase.name : null;
  const statusStyle = taskStatusStyle(data.status);
  const isTrackingThisTask = activeLog?.clock_status === 'ON' && activeLog.task === data.id;
  const assigneeNames =
    data.assignees?.map(a => studioUserLabel({ name: a.name, first_name: a.first_name, email: a.email ?? '' })) ?? [];
  const isArchived = data.state === 'ARC';
  const projectId =
    typeof data.project === 'object' && data.project?.id
      ? data.project.id
      : typeof data.project === 'number'
        ? data.project
        : null;

  const showTaskActions = () => {
    hapticLight();
    Alert.alert('Task actions', undefined, [
      isArchived
        ? {
            text: 'Restore task',
            onPress: () => archiveMutation.mutate('AC'),
          }
        : {
            text: 'Archive task',
            onPress: () => archiveMutation.mutate('ARC'),
          },
      {
        text: 'Delete task',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete this task?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTimer = async () => {
    try {
      if (isTrackingThisTask) {
        await clockOut();
        return;
      }
      if (activeLog?.clock_status === 'ON') {
        Alert.alert('Timer already running', 'Stop the current timer before starting this task.');
        return;
      }
      const projectId =
        typeof data.project === 'object' && data.project?.id
          ? data.project.id
          : typeof data.project === 'number'
            ? data.project
            : null;
      await clockIn({
        project: projectId,
        task: data.id,
        description: data.title,
      });
    } catch {
      Alert.alert('Timer error', 'Could not update the timer. Please try again.');
    }
  };

  return (
    <ScreenCanvas edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Task',
          headerLargeTitle: false,
          headerRight: () => (
            <StackHeaderActions>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => router.push(routes.taskEdit(data.id))}
                  hitSlop={8}
                  style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
                <Pressable onPress={showTaskActions} hitSlop={8} style={styles.moreButton}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
                </Pressable>
              </View>
            </StackHeaderActions>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {isArchived ? (
          <View style={styles.archivedBanner}>
            <Ionicons name="archive-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.archivedText}>This task is archived</Text>
          </View>
        ) : null}

        <View style={styles.hero}>
          <StatusBadge
            label={taskStatusLabel(data.status)}
            color={statusStyle.color}
            backgroundColor={statusStyle.bg}
          />
          <Text style={styles.title}>{data.title}</Text>
          {projectName ? <Text style={styles.project}>{projectName}</Text> : null}
          {phaseName ? <Text style={styles.phase}>{phaseName}</Text> : null}
          <Pressable
            style={[styles.timerButton, isTrackingThisTask && styles.timerButtonActive]}
            onPress={handleTimer}
            disabled={isClockingIn || isClockingOut}
          >
            <Ionicons
              name={isTrackingThisTask ? 'stop' : 'play'}
              size={16}
              color={isTrackingThisTask ? colors.primaryForeground : colors.primary}
            />
            <Text style={[styles.timerButtonText, isTrackingThisTask && styles.timerButtonTextActive]}>
              {isClockingIn || isClockingOut
                ? 'Please wait…'
                : isTrackingThisTask
                  ? 'Stop timer'
                  : 'Start timer'}
            </Text>
          </Pressable>
        </View>

        <Card>
          <Text style={styles.cardLabel}>Status</Text>
          <FilterChips
            options={TASK_STATUS_OPTIONS.map(s => ({ key: s.code, label: s.label }))}
            value={data.status}
            onChange={status => {
              hapticLight();
              statusMutation.mutate(status);
            }}
          />
          {statusMutation.isPending ? <Text style={styles.saving}>Updating…</Text> : null}
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Details</Text>
          {data.priority ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Priority</Text>
              <Text style={[styles.detailValue, { color: priorityColor(data.priority) }]}>
                {priorityLabel(data.priority)}
              </Text>
            </View>
          ) : null}
          {data.end_date || data.due_date ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Due</Text>
              <Text style={styles.detailValue}>{formatDate(data.end_date ?? data.due_date)}</Text>
            </View>
          ) : null}
          {data.start_date ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Start</Text>
              <Text style={styles.detailValue}>{formatDate(data.start_date)}</Text>
            </View>
          ) : null}
          {assigneeNames.length > 0 ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Assignees</Text>
              <Text style={[styles.detailValue, styles.detailValueWrap]}>{assigneeNames.join(', ')}</Text>
            </View>
          ) : null}
        </Card>

        {data.description ? (
          <Card>
            <Text style={styles.cardLabel}>Description</Text>
            <Text style={styles.description}>{data.description}</Text>
          </Card>
        ) : null}

        {data.subtask && data.subtask.length > 0 ? (
          <Card>
            <Text style={styles.cardLabel}>Subtasks</Text>
            {data.subtask.map(item => (
              <Pressable
                key={item.id}
                style={styles.subtaskRow}
                onPress={() =>
                  subtaskMutation.mutate({ subtaskId: item.id, isCompleted: !item.is_completed })
                }
                disabled={subtaskMutation.isPending}
              >
                <View style={[styles.subtaskDot, item.is_completed && styles.subtaskDotDone]} />
                <Text style={[styles.subtaskText, item.is_completed && styles.subtaskDone]}>{item.subtask}</Text>
              </Pressable>
            ))}
            <ProgressBar
              value={(data.subtask.filter(s => s.is_completed).length / data.subtask.length) * 100}
            />
          </Card>
        ) : null}

        <TaskAttachments taskId={data.id} />

        <TaskComments
          taskId={data.id}
          projectId={projectId}
          comments={data.comments ?? []}
        />
      </ScrollView>
    </ScreenCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  moreButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  archivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  archivedText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  editButtonPressed: {
    opacity: 0.6,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    marginTop: spacing.sm,
  },
  project: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  phase: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  timerButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  timerButtonTextActive: {
    color: colors.primaryForeground,
  },
  cardLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  saving: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
    gap: spacing.md,
  },
  detailKey: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  detailValueWrap: {
    maxWidth: '65%',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  subtaskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  subtaskDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  subtaskDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
