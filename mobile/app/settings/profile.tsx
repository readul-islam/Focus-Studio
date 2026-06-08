import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AvatarCircle } from '@/components/design-system';
import { Button, Input } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function ProfileSettingsScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setTitle(user?.title ?? '');
    setPhone(user?.phone_number ?? '');
  }, [user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/user/self/update/', {
        name: name.trim(),
        title: title.trim() || null,
        phone_number: phone.trim() || null,
      });
      return response.data;
    },
    onSuccess: async () => {
      await refreshUser();
      Alert.alert('Saved', 'Your profile has been updated.');
    },
    onError: () => {
      Alert.alert('Could not save', 'Please check your details and try again.');
    },
  });

  const displayName = user?.name ?? user?.first_name ?? user?.email ?? 'User';

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    mutation.mutate();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarCard}>
          <AvatarCircle name={displayName} size={64} />
          <Text style={styles.avatarHint}>Profile photos can be updated on the web app.</Text>
        </View>

        <FieldLabel>Email</FieldLabel>
        <View style={styles.readOnly}>
          <Text style={styles.readOnlyText}>{user?.email}</Text>
        </View>

        <FieldLabel>Name</FieldLabel>
        <Input value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />

        <FieldLabel>Title</FieldLabel>
        <Input value={title} onChangeText={setTitle} placeholder="e.g. Senior Designer" autoCapitalize="words" />

        <FieldLabel>Phone</FieldLabel>
        <Input value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />

        <View style={styles.metaCard}>
          <MetaRow label="Role" value={capitalize(user?.role ?? '—')} />
          <MetaRow label="Studio" value={user?.studio?.name ?? '—'} />
        </View>

        <Button label="Save changes" onPress={handleSave} loading={mutation.isPending} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  avatarCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  avatarHint: {
    ...typography.caption,
    textAlign: 'center',
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 14,
    color: colors.textSecondary,
  },
  readOnly: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  readOnlyText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
