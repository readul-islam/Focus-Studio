import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { PasswordField } from '@/components/settings/PasswordField';
import { TwoFactorPanel } from '@/components/settings/TwoFactorPanel';
import { Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { api } from '@/lib/api';

export default function SecuritySettingsScreen() {
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/user/self/change-password/', {
        current_password: current,
        new_password: newPassword,
        confirm_new_password: confirm,
      });
    },
    onSuccess: () => {
      setCurrent('');
      setNewPassword('');
      setConfirm('');
      setErrors({});
      Alert.alert('Password updated', 'Your password has been changed successfully.');
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      if (data?.error && typeof data.error === 'string') {
        Alert.alert('Could not update', data.error);
        return;
      }
      Alert.alert('Could not update', 'Check your current password and try again.');
    },
  });

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (!current) nextErrors.current = 'Current password is required';
    if (newPassword.length < 8) nextErrors.new = 'Use at least 8 characters';
    if (confirm !== newPassword) nextErrors.confirm = 'Passwords do not match';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    mutation.mutate();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: 'Security' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Two-factor authentication</Text>
        <TwoFactorPanel />

        <Text style={styles.sectionTitle}>Change password</Text>
        <PasswordField
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          error={errors.current}
        />
        <PasswordField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          error={errors.new}
          placeholder="At least 8 characters"
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
        />

        <Button label="Update password" onPress={handleSubmit} loading={mutation.isPending} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 17,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
});
