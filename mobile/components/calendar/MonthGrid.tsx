import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  daysWithEntries,
  getMonthGridDays,
  isSameDay,
  isSameMonth,
  toDateKey,
  type CalendarEntry,
  type CalendarFilter,
} from '@/lib/calendar';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type MonthGridProps = {
  month: Date;
  selectedDate: Date;
  entries: CalendarEntry[];
  filter: CalendarFilter;
  onSelectDate: (date: Date) => void;
};

export function MonthGrid({ month, selectedDate, entries, filter, onSelectDate }: MonthGridProps) {
  const days = getMonthGridDays(month);
  const markedDays = daysWithEntries(entries, days, filter);
  const today = new Date();

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map(day => {
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const inMonth = isSameMonth(day, month);
          const selected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const hasEvents = markedDays.has(toDateKey(day));

          return (
            <Pressable
              key={key}
              onPress={() => onSelectDate(day)}
              style={styles.dayCell}
            >
              <View
                style={[
                  styles.dayInner,
                  selected && styles.dayInnerSelected,
                  isToday && !selected && styles.dayInnerToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !inMonth && styles.dayTextMuted,
                    selected && styles.dayTextSelected,
                    isToday && !selected && styles.dayTextToday,
                  ]}
                >
                  {day.getDate()}
                </Text>
                {hasEvents ? <View style={[styles.dot, selected && styles.dotSelected]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.label,
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  dayInnerSelected: {
    backgroundColor: colors.primary,
  },
  dayInnerToday: {
    borderWidth: 1,
    borderColor: colors.clay,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dayTextMuted: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: colors.primaryForeground,
  },
  dayTextToday: {
    color: colors.clay,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.clay,
    marginTop: 3,
  },
  dotSelected: {
    backgroundColor: colors.primaryForeground,
  },
});
