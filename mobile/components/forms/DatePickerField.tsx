import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatDate } from '@/lib/format';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function DatePickerField({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const selected = parseIsoDate(value) ?? new Date();

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    onChange(toIsoDate(date));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed, error && styles.fieldError]}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatDate(value) : 'Select date'}
        </Text>
        {value ? (
          <Pressable
            onPress={event => {
              event.stopPropagation();
              onChange('');
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {showPicker ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}
      {Platform.OS === 'ios' && showPicker ? (
        <Pressable onPress={() => setShowPicker(false)} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  fieldPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
