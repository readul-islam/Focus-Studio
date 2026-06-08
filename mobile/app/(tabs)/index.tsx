import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { DashboardData, NotificationItem, TaskItem } from '@focuspilot/shared';
import {
  ErrorState,
  KpiCard,
  ListCard,
  ScreenCanvas,
  ScreenScroll,
  SectionHeader,
  StatusBadge,
} from '@/components/design-system';
import { DailyBriefCard } from '@/components/home/DailyBriefCard';
import { QuickActions } from '@/components/home/QuickActions';
import { LoadingScreen, Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { formatRelativeDate, greetingName } from '@/lib/format';
import { taskStatusLabel, taskStatusStyle } from '@/lib/task-utils';
import { useAuth } from '@/context/AuthContext';
import { useTimeTracker } from '@/context/TimeTrackerContext';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { useDailyBrief } from '@/hooks/useDailyBrief';
import { formatDurationParts } from '@/lib/time';
import { HeaderActions } from '@/components/search/HeaderActions';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { api } from '@/lib/api';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationRoute } from '@/lib/notifications';
import {
  dashboardGreetingLine,
  dashboardGreetingSubtitle,
  getDueSoonTasks,
  normalizeDashboard,
} from '@/lib/dashboard';
import { routes } from '@/lib/routes';

async function fetchDashboard(): Promise<DashboardData> {
  const response = await api.get<DashboardData>('/user/dashboard/');
  return response.data;
}

async function fetchTasks(): Promise<TaskItem[]> {
  const response = await api.get<TaskItem[]>('/task/user-tasks/');
  return response.data;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { activeLog, summary } = useTimeTracker();
  const elapsed = useElapsedTimer(activeLog?.start_time);
  const isRunning = activeLog?.clock_status === 'ON';
  const { brief, isLoading: briefLoading, isError: briefError, refetch: refetchBrief } = useDailyBrief();

  const dashboardQuery = useQuery({
    queryKey: ['user/dashboard/'],
    queryFn: fetchDashboard,
  });

  const tasksQuery = useQuery({
    queryKey: ['task/user-tasks/'],
    queryFn: fetchTasks,
  });

  const handleRefresh = () => {
    dashboardQuery.refetch();
    tasksQuery.refetch();
    refetchBrief();
  };

  if (dashboardQuery.isLoading && !dashboardQuery.data) {
    return <LoadingScreen />;
  }

  if (dashboardQuery.isError && !dashboardQuery.data) {
    return (
      <ScreenCanvas>
        <ErrorState title="Couldn't load dashboard" onRetry={handleRefresh} />
      </ScreenCanvas>
    );
  }

  const dashboard = normalizeDashboard(dashboardQuery.data ?? { greeting: { name: '' } });
  const firstName = greetingName(user?.first_name, user?.name, user?.email);
  const greeting = dashboardGreetingLine(dashboard.greeting, firstName);
  const greetingSubtitle = dashboardGreetingSubtitle(dashboard.greeting);
  const dueSoon = getDueSoonTasks(tasksQuery.data ?? []);
  const recentNotifications = notifications.filter(n => !n.is_read).slice(0, 3);
  const isRefreshing = dashboardQuery.isRefetching || tasksQuery.isRefetching;

  const handleNotificationPress = (notification: NotificationItem) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    const route = getNotificationRoute(notification);
    if (route) router.push(route);
  };

  return (
    <ScreenCanvas edges={[]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HeaderActions />
              <NotificationBell />
            </View>
          ),
        }}
      />
      <ScreenScroll
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.greeting}>{greeting}</Text>
          {greetingSubtitle ? <Text style={styles.heroSubtitle}>{greetingSubtitle}</Text> : null}
          {user?.studio?.name ? <Text style={styles.studio}>{user.studio.name}</Text> : null}
        </View>

        <QuickActions />

        <DailyBriefCard
          brief={brief}
          isLoading={briefLoading}
          isError={briefError}
          onRetry={() => refetchBrief()}
        />

        <Pressable style={[styles.timeCard, isRunning && styles.timeCardActive]} onPress={() => router.push('/time')}>
          <View style={styles.timeCardLeft}>
            <View style={[styles.timeIcon, isRunning && styles.timeIconActive]}>
              <Ionicons name="time-outline" size={20} color={isRunning ? colors.clay : colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.timeCardLabel}>{isRunning ? 'Timer running' : 'Time tracking'}</Text>
              <Text style={styles.timeCardValue}>
                {isRunning
                  ? elapsed
                  : summary
                    ? `${formatDurationParts(summary.today.hours, summary.today.minutes)} today`
                    : 'Tap to track time'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {dashboard.kpis.length > 0 ? (
          <>
            <SectionHeader title="At a glance" />
            <View style={styles.kpiRow}>
              {dashboard.kpis.slice(0, 2).map(kpi => (
                <KpiCard
                  key={String(kpi.label)}
                  label={kpi.label}
                  value={kpi.value}
                  subtitle={kpi.trend}
                  accent={colors.clay}
                />
              ))}
            </View>
            {dashboard.kpis[2] ? (
              <View style={styles.kpiRowSingle}>
                <KpiCard
                  label={dashboard.kpis[2].label}
                  value={dashboard.kpis[2].value}
                  subtitle={dashboard.kpis[2].trend}
                  accent={colors.brand}
                />
              </View>
            ) : null}
          </>
        ) : null}

        {recentNotifications.length > 0 ? (
          <>
            <SectionHeader
              title="Notifications"
              subtitle={`${unreadCount} unread`}
              actionLabel="See all"
              onAction={() => router.push('/notifications')}
            />
            {recentNotifications.map(notification => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
          </>
        ) : null}

        <SectionHeader
          title="Overdue"
          subtitle={dashboard.overdue.count ? `${dashboard.overdue.count} need attention` : undefined}
          actionLabel={dashboard.overdue.tasks.length > 0 ? 'All tasks' : undefined}
          onAction={dashboard.overdue.tasks.length > 0 ? () => router.push('/(tabs)/tasks') : undefined}
        />
        {dashboard.overdue.tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyMessage}>No overdue tasks right now.</Text>
          </View>
        ) : (
          dashboard.overdue.tasks.slice(0, 5).map(task => {
            const style = taskStatusStyle(task.status ?? 'TD');
            return (
              <ListCard
                key={task.id}
                title={task.title}
                subtitle={task.project_name}
                meta={task.due_date ? formatRelativeDate(task.due_date) : undefined}
                badge={
                  task.status ? (
                    <StatusBadge label={taskStatusLabel(task.status)} color={style.color} backgroundColor={style.bg} />
                  ) : undefined
                }
                onPress={() => router.push(`/task/${task.id}`)}
              />
            );
          })
        )}

        <SectionHeader
          title="Due soon"
          subtitle={dueSoon.length ? 'Next 7 days' : undefined}
          actionLabel={dueSoon.length > 0 ? 'All tasks' : undefined}
          onAction={dueSoon.length > 0 ? () => router.push('/(tabs)/tasks') : undefined}
        />
        {dueSoon.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing due this week</Text>
            <Text style={styles.emptyMessage}>Tasks with due dates in the next 7 days appear here.</Text>
            <Button label="Create task" variant="secondary" onPress={() => router.push(routes.taskNew)} />
          </View>
        ) : (
          dueSoon.map(task => {
            const style = taskStatusStyle(task.status);
            const projectName = task.project?.name ?? task.project_name;
            return (
              <ListCard
                key={task.id}
                title={task.title}
                subtitle={projectName}
                meta={formatRelativeDate(task.due_date ?? task.end_date)}
                badge={
                  <StatusBadge label={taskStatusLabel(task.status)} color={style.color} backgroundColor={style.bg} />
                }
                onPress={() => router.push(`/task/${task.id}`)}
              />
            );
          })
        )}

        {dashboard.meetings.length > 0 ? (
          <>
            <SectionHeader title="Today" actionLabel="Calendar" onAction={() => router.push('/calendar')} />
            {dashboard.meetings.map((meeting, index) => (
              <ListCard
                key={`${meeting.summary}-${index}`}
                title={meeting.summary}
                meta={meeting.time}
                onPress={() => router.push('/calendar')}
              />
            ))}
          </>
        ) : null}

        <SectionHeader
          title="Jump back in"
          actionLabel={dashboard.projects.length > 0 ? 'All projects' : undefined}
          onAction={dashboard.projects.length > 0 ? () => router.push('/(tabs)/projects') : undefined}
        />
        {dashboard.projects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No recent projects</Text>
            <Text style={styles.emptyMessage}>Create a project or get assigned to one by your team.</Text>
            <Button label="Create project" variant="secondary" onPress={() => router.push(routes.projectNew)} />
          </View>
        ) : (
          dashboard.projects.slice(0, 5).map(project => (
            <ListCard
              key={project.id}
              title={project.name}
              subtitle={project.status}
              meta={typeof project.progress === 'number' ? `${project.progress}% complete` : undefined}
              onPress={() => router.push(`/project/${project.id}`)}
            />
          ))
        )}
      </ScreenScroll>
    </ScreenCanvas>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.title,
    fontSize: 26,
  },
  heroSubtitle: {
    ...typography.caption,
    marginTop: 4,
    color: colors.textSecondary,
  },
  studio: {
    ...typography.caption,
    marginTop: 4,
    color: colors.textMuted,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  timeCardActive: {
    borderColor: colors.clay,
    backgroundColor: '#fffaf8',
  },
  timeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeIconActive: {
    backgroundColor: '#ffedd5',
  },
  timeCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeCardValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  kpiRowSingle: {
    marginBottom: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  emptyMessage: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
