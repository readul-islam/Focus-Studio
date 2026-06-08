import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEntryRow } from '@/components/calendar/CalendarEntryRow';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import {
  ErrorState,
  FilterChips,
  LoadingInline,
  ScreenCanvas,
  ScreenScroll,
  SectionHeader,
} from '@/components/design-system';
import { LoadingScreen } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useCalendar } from '@/hooks/useCalendar';
import {
  addMonths,
  entriesForDay,
  formatMonthYear,
  formatSelectedDay,
  parseCalendarDate,
  startOfMonth,
  type CalendarFilter,
} from '@/lib/calendar';

const filterOptions: { key: CalendarFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'phases', label: 'Phases' },
  { key: 'delivery', label: 'Deliveries' },
  { key: 'meetings', label: 'Meetings' },
];

export default function CalendarScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const initialDate = useMemo(() => {
    const parsed = typeof date === 'string' ? parseCalendarDate(date) : null;
    return parsed ?? new Date();
  }, [date]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(initialDate));
  const [filter, setFilter] = useState<CalendarFilter>('all');

  const { entries, calendarConnected, gmailConnected, isLoading, isError, isRefetching, refetch } =
    useCalendar(currentMonth);

  const visibleFilters = useMemo(() => {
    if (calendarConnected) return filterOptions;
    return filterOptions.filter(option => option.key !== 'meetings');
  }, [calendarConnected]);

  const dayEntries = useMemo(
    () => entriesForDay(entries, selectedDate, filter),
    [entries, selectedDate, filter]
  );

  const handleSelectDate = (day: Date) => {
    setSelectedDate(day);
    if (day.getMonth() !== currentMonth.getMonth() || day.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(startOfMonth(day));
    }
  };

  const handleEntryPress = (entry: (typeof dayEntries)[number]) => {
    if (entry.projectId) {
      router.push(`/project/${entry.projectId}` as Href);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenCanvas edges={[]}>
      <Stack.Screen options={{ title: 'Calendar' }} />
      <ScreenScroll
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {isError ? (
          <ErrorState title="Couldn't load calendar" onRetry={refetch} />
        ) : (
          <>
            <View style={styles.monthHeader}>
              <Pressable
                onPress={() => setCurrentMonth(prev => addMonths(prev, -1))}
                style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
                hitSlop={8}
              >
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.monthTitle}>{formatMonthYear(currentMonth)}</Text>
              <Pressable
                onPress={() => setCurrentMonth(prev => addMonths(prev, 1))}
                style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
                hitSlop={8}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </Pressable>
            </View>

            <MonthGrid
              month={currentMonth}
              selectedDate={selectedDate}
              entries={entries}
              filter={filter}
              onSelectDate={handleSelectDate}
            />

            {!calendarConnected ? (
              <View style={styles.hintCard}>
                <Ionicons name="logo-google" size={18} color={colors.textMuted} />
                <Text style={styles.hintText}>
                  {gmailConnected
                    ? 'Google Calendar sync is not active yet. Connect it from the web app settings.'
                    : 'Connect Google Calendar on the web app to see meetings here.'}
                </Text>
              </View>
            ) : null}

            <FilterChips options={visibleFilters} value={filter} onChange={setFilter} />

            <SectionHeader
              title={formatSelectedDay(selectedDate)}
              subtitle={dayEntries.length ? `${dayEntries.length} item${dayEntries.length === 1 ? '' : 's'}` : 'Nothing scheduled'}
            />

            {isRefetching && dayEntries.length === 0 ? <LoadingInline /> : null}

            {dayEntries.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Clear day</Text>
                <Text style={styles.emptyMessage}>No phases, deliveries, or meetings on this date.</Text>
              </View>
            ) : (
              dayEntries.map(entry => (
                <CalendarEntryRow
                  key={entry.id}
                  entry={entry}
                  onPress={entry.projectId ? () => handleEntryPress(entry) : undefined}
                />
              ))
            )}
          </>
        )}
      </ScreenScroll>
    </ScreenCanvas>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthTitle: {
    ...typography.heading,
    fontSize: 18,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.subheading,
    marginTop: spacing.xs,
  },
  emptyMessage: {
    ...typography.caption,
    textAlign: 'center',
  },
});
