import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui';
import { colors, radius } from '@/constants/theme';

type SearchCreateRowProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onCreate: () => void;
  createAccessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

export function SearchCreateRow({
  value,
  onChangeText,
  placeholder,
  onCreate,
  createAccessibilityLabel,
  style,
}: SearchCreateRowProps) {
  return (
    <View style={[styles.row, style]}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
        style={styles.input}
      />
      <Pressable
        onPress={onCreate}
        style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={createAccessibilityLabel}
      >
        <Ionicons name="add" size={22} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  createButtonPressed: {
    opacity: 0.85,
  },
});
