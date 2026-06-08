import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  accessibilityLabel,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.buttonPrimary,
        isDanger && styles.buttonDanger,
        variant === 'secondary' && styles.buttonSecondary,
        (pressed || disabled || loading) && isPrimary && styles.buttonPrimaryPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? colors.primaryForeground : colors.text} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isPrimary || isDanger ? styles.buttonTextOnPrimary : styles.buttonTextSecondary,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export const Input = forwardRef<TextInput, TextInputProps & { leading?: ReactNode }>(function Input(
  { style, editable = true, onFocus, leading, ...props },
  ref,
) {
  const innerRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => innerRef.current as TextInput);

  const focusInput = () => {
    if (editable) {
      innerRef.current?.focus();
    }
  };

  return (
    <Pressable
      onPress={focusInput}
      disabled={!editable}
      style={[styles.inputWrapper, style as ViewStyle]}
    >
      {leading ? <View style={styles.inputLeading}>{leading}</View> : null}
      <TextInput
        ref={innerRef}
        editable={editable}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        collapsable={false}
        pointerEvents="none"
        {...props}
        onFocus={onFocus}
        style={[styles.inputInner, leading ? styles.inputInnerWithLeading : null]}
      />
    </Pressable>
  );
});

export const TextArea = forwardRef<TextInput, TextInputProps>(function TextArea(
  { style, editable = true, ...props },
  ref,
) {
  const innerRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => innerRef.current as TextInput);

  return (
    <TextInput
      ref={innerRef}
      editable={editable}
      placeholderTextColor={colors.textMuted}
      multiline
      textAlignVertical="top"
      {...props}
      style={[styles.textArea, style]}
    />
  );
});

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </View>
  );
}

export function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPrimaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextOnPrimary: {
    color: colors.primaryForeground,
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    minHeight: 44,
  },
  inputLeading: {
    paddingLeft: spacing.md,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 44,
    color: colors.text,
    fontSize: 14,
  },
  inputInnerWithLeading: {
    paddingLeft: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 120,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
});
