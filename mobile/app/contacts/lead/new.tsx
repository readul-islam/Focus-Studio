import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { FilterChips } from '@/components/design-system';
import { Button, Input } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-errors';
import { hapticSuccess } from '@/lib/haptics';
import { createLead, LEAD_SOURCES } from '@/lib/leads';

const sourceOptions = LEAD_SOURCES.map(source => ({ key: source, label: source }));

export default function NewLeadScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<string>(LEAD_SOURCES[0]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!user?.studio?.id || !user.id) {
        throw new Error('Studio account required.');
      }
      if (!title.trim() || !fullName.trim() || !phone.trim()) {
        throw new Error('Title, name, and phone are required.');
      }
      return createLead({
        title: title.trim(),
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        source,
        studio: user.studio.id,
        owner: user.id,
      });
    },
    onSuccess: lead => {
      hapticSuccess();
      router.replace(`/contacts/lead/${lead.id}`);
    },
    onError: error => {
      Alert.alert('Could not create lead', getApiErrorMessage(error));
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'New lead' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Lead title *</Text>
        <Input value={title} onChangeText={setTitle} placeholder="e.g. Kensington renovation" />
        <Text style={styles.label}>Contact name *</Text>
        <Input value={fullName} onChangeText={setFullName} placeholder="Full name" />
        <Text style={styles.label}>Email</Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="client@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Phone *</Text>
        <Input value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
        <Text style={styles.label}>Source</Text>
        <FilterChips
          options={sourceOptions}
          value={source}
          onChange={value => setSource(value)}
        />

        <View style={styles.actions}>
          <Button label="Create lead" onPress={() => mutation.mutate()} loading={mutation.isPending} />
          <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
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
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: 4,
  },
});
