import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { TaskItem } from '@focuspilot/shared';
import { useTimeTracker } from '@/context/TimeTrackerContext';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { api } from '@/lib/api';

const TAB_BAR_OFFSET = Platform.OS === 'ios' ? 84 : 64;

async function fetchTasks(): Promise<TaskItem[]> {
  const response = await api.get<TaskItem[]>('/task/user-tasks/');
  return response.data;
}

export function ActiveTimerBar() {
  const { activeLog, clockOut, isClockingOut } = useTimeTracker();
  const elapsed = useElapsedTimer(activeLog?.start_time);

  const { data: tasks } = useQuery({
    queryKey: ['task/user-tasks/'],
    queryFn: fetchTasks,
    enabled: Boolean(activeLog?.task),
    staleTime: 60_000,
  });

  if (!activeLog || activeLog.clock_status !== 'ON') {
    return null;
  }

  const taskTitle = tasks?.find(t => t.id === activeLog.task)?.title;
  const label = taskTitle ?? activeLog.description ?? 'Tracking time';

  return (
    <View style={[styles.wrap, { bottom: TAB_BAR_OFFSET }]}>
      <Pressable style={styles.bar} onPress={() => router.push('/time')}>
        <View style={styles.liveDot} />
        <View style={styles.textBlock}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.elapsed}>{elapsed}</Text>
        </View>
        <Pressable
          style={styles.stopButton}
          onPress={e => {
            e.stopPropagation?.();
            clockOut();
          }}
          disabled={isClockingOut}
        >
          <Ionicons name="stop" size={14} color={colors.primaryForeground} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 50,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  elapsed: {
    color: colors.primaryForeground,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
