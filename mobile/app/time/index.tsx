import { useMemo } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { TaskItem, TimeLogItem } from '@focuspilot/shared';
import {
  ErrorState,
  KpiCard,
  ListCard,
  LoadingInline,
  ScreenCanvas,
  SectionHeader,
} from '@/components/design-system';
import { useTimeTracker } from '@/context/TimeTrackerContext';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatDurationParts } from '@/lib/time';
import { api } from '@/lib/api';

async function fetchTasks(): Promise<TaskItem[]> {
  const response = await api.get<TaskItem[]>('/task/user-tasks/');
  return response.data;
}

async function fetchTimeLogs(): Promise<TimeLogItem[]> {
  const response = await api.get<TimeLogItem[]>('/time_tracker/user-time-logs/');
  return response.data;
}

export default function TimeScreen() {
  const { activeLog, summary, clockIn, clockOut, isClockingIn, isClockingOut, refresh } = useTimeTracker();
  const elapsed = useElapsedTimer(activeLog?.start_time);
  const isRunning = activeLog?.clock_status === 'ON';

  const tasksQuery = useQuery({
    queryKey: ['task/user-tasks/'],
    queryFn: fetchTasks,
  });

  const logsQuery = useQuery({
    queryKey: ['time_tracker/user-time-logs/'],
    queryFn: fetchTimeLogs,
  });

  const recentTasks = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    return tasks.filter(t => t.status !== 'D').slice(0, 6);
  }, [tasksQuery.data]);

  const recentLogs = useMemo(() => {
    return (logsQuery.data ?? []).slice(0, 8);
  }, [logsQuery.data]);

  const handleStartTask = async (task: TaskItem) => {
    if (isRunning) {
      Alert.alert('Timer already running', 'Stop the current timer before starting a new one.');
      return;
    }
    try {
      await clockIn({
        project: task.project?.id ?? null,
        task: task.id,
        description: task.title,
      });
    } catch {
      Alert.alert('Could not start timer', 'Please try again.');
    }
  };

  const refetchAll = () => {
    refresh();
    tasksQuery.refetch();
    logsQuery.refetch();
  };

  if (tasksQuery.isLoading && logsQuery.isLoading) {
    return (
      <ScreenCanvas>
        <LoadingInline />
      </ScreenCanvas>
    );
  }

  return (
    <ScreenCanvas edges={['bottom']}>
      <Stack.Screen options={{ title: 'Time' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={tasksQuery.isRefetching || logsQuery.isRefetching}
            onRefresh={refetchAll}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.timerHero, isRunning && styles.timerHeroActive]}>
          <View style={styles.timerIconWrap}>
            <Ionicons name="time-outline" size={28} color={isRunning ? colors.clay : colors.textMuted} />
          </View>
          <Text style={styles.timerLabel}>{isRunning ? 'Currently tracking' : 'Ready to track'}</Text>
          <Text style={styles.timerValue}>{isRunning ? elapsed : '00:00:00'}</Text>
          {isRunning ? (
            <Pressable
              style={[styles.heroButton, styles.heroButtonStop]}
              onPress={() => clockOut()}
              disabled={isClockingOut}
            >
              <Ionicons name="stop" size={18} color={colors.primaryForeground} />
              <Text style={styles.heroButtonText}>{isClockingOut ? 'Stopping…' : 'Stop timer'}</Text>
            </Pressable>
          ) : (
            <Text style={styles.heroHint}>Pick a task below to start tracking</Text>
          )}
        </View>

        {summary ? (
          <>
            <SectionHeader title="Summary" />
            <View style={styles.kpiRow}>
              <KpiCard
                label="Today"
                value={formatDurationParts(summary.today.hours, summary.today.minutes)}
                accent={colors.clay}
              />
              <KpiCard
                label="This week"
                value={formatDurationParts(summary.this_week.hours, summary.this_week.minutes)}
                accent={colors.brand}
              />
            </View>
            <View style={styles.kpiRowSingle}>
              <KpiCard
                label="This month"
                value={formatDurationParts(summary.this_month.hours, summary.this_month.minutes)}
                accent={colors.success}
              />
            </View>
          </>
        ) : null}

        <SectionHeader title="Start on a task" subtitle="Tap to clock in" />
        {recentTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No open tasks to track.</Text>
          </View>
        ) : (
          recentTasks.map(task => (
            <Pressable
              key={task.id}
              style={[styles.taskPick, isClockingIn && styles.taskPickDisabled]}
              onPress={() => handleStartTask(task)}
              disabled={isClockingIn || isRunning}
            >
              <View style={styles.taskPickIcon}>
                <Ionicons name="play" size={14} color={colors.primaryForeground} />
              </View>
              <View style={styles.taskPickBody}>
                <Text style={styles.taskPickTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.taskPickMeta} numberOfLines={1}>
                  {task.project?.name ?? task.project_name ?? 'No project'}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        <SectionHeader title="Recent logs" />
        {logsQuery.isError ? (
          <ErrorState title="Couldn't load time logs" onRetry={() => logsQuery.refetch()} />
        ) : recentLogs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Your time entries will appear here.</Text>
          </View>
        ) : (
          recentLogs.map(log => (
            <ListCard
              key={log.id}
              title={log.task?.title ?? log.description ?? 'Time entry'}
              subtitle={log.project?.project_name ?? log.project?.name}
              meta={log.duration ?? (log.clock_status === 'ON' ? 'Running' : undefined)}
              showChevron={false}
            />
          ))
        )}
      </ScrollView>
    </ScreenCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  timerHero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  timerHeroActive: {
    borderColor: colors.clay,
    backgroundColor: '#fffaf8',
  },
  timerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timerValue: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  heroHint: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  heroButtonStop: {
    backgroundColor: colors.danger,
  },
  heroButtonText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  kpiRowSingle: {
    marginBottom: spacing.sm,
  },
  taskPick: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  taskPickDisabled: {
    opacity: 0.6,
  },
  taskPickIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskPickBody: {
    flex: 1,
  },
  taskPickTitle: {
    ...typography.subheading,
    fontSize: 15,
  },
  taskPickMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
