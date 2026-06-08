import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrmContact } from '@focuspilot/shared';
import { FilterChips } from '@/components/design-system';
import { Button, Input, TextArea } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { contactDisplayName } from '@/lib/crm';
import {
  getApiErrorMessage,
  hasComposeErrors,
  isValidEmail,
  plainTextToHtml,
  sendGmailEmail,
  validateNewEmail,
} from '@/lib/email-compose';
import { hapticSuccess } from '@/lib/haptics';
import { api } from '@/lib/api';

type RecipientMode = 'client' | 'custom';

type ComposeEmailFormProps = {
  onSuccess: (threadId?: string) => void;
  onCancel: () => void;
};

async function fetchClientsWithEmail(): Promise<CrmContact[]> {
  const response = await api.get<CrmContact[]>('/crm/studio-clients/');
  return response.data.filter(client => client.email?.trim());
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Text style={styles.sectionLabel}>
      {children}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
}

export function ComposeEmailForm({ onSuccess, onCancel }: ComposeEmailFormProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<RecipientMode>('client');
  const [clientId, setClientId] = useState<number | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState(false);

  const clientsQuery = useQuery({
    queryKey: ['crm/studio-clients/'],
    queryFn: fetchClientsWithEmail,
  });

  const clients = clientsQuery.data ?? [];
  const search = clientSearch.trim().toLowerCase();
  const filteredClients = search
    ? clients.filter(client => {
        const label = contactDisplayName(client).toLowerCase();
        const email = client.email?.toLowerCase() ?? '';
        return label.includes(search) || email.includes(search);
      })
    : clients;

  const selectedClient = clients.find(client => client.id === clientId);
  const resolvedEmail =
    mode === 'client' ? selectedClient?.email?.trim() ?? '' : customEmail.trim();

  const mutation = useMutation({
    mutationFn: async () =>
      sendGmailEmail({
        to_email: resolvedEmail,
        subject: subject.trim(),
        body: plainTextToHtml(body.trim()),
      }),
    onSuccess: async result => {
      await queryClient.invalidateQueries({ queryKey: ['gmail/threads'] });
      hapticSuccess();
      onSuccess(result.thread_id);
    },
    onError: (error: unknown) => {
      Alert.alert('Could not send email', getApiErrorMessage(error, 'Check your connection and try again.'));
    },
  });

  const handleSubmit = useCallback(() => {
    setTouched(true);
    const nextErrors = validateNewEmail({
      toEmail: resolvedEmail,
      subject,
      body,
    });
    if (mode === 'client' && !clientId) {
      nextErrors.toEmail = 'Select a client with an email address';
    }
    if (mode === 'custom' && !isValidEmail(customEmail)) {
      nextErrors.toEmail = 'Enter a valid email address';
    }
    setErrors(nextErrors);
    if (hasComposeErrors(nextErrors)) return;
    mutation.mutate();
  }, [body, clientId, customEmail, mode, mutation, resolvedEmail, subject]);

  const modeOptions = useMemo(
    () => [
      { key: 'client' as const, label: 'Client' },
      { key: 'custom' as const, label: 'Custom' },
    ],
    [],
  );

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Send a new email from your connected Gmail account.</Text>

        <FieldLabel required>To</FieldLabel>
        <FilterChips options={modeOptions} value={mode} onChange={setMode} />

        {mode === 'client' ? (
          clients.length === 0 ? (
            <View style={styles.emptyClients}>
              <Text style={styles.emptyClientsText}>No clients with email addresses yet.</Text>
              <Text style={styles.hint}>Add a client with an email, or use Custom to enter an address.</Text>
            </View>
          ) : (
            <>
              <Input
                value={clientSearch}
                onChangeText={setClientSearch}
                placeholder="Search clients…"
                leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {filteredClients.map(client => (
                  <Chip
                    key={client.id}
                    label={`${contactDisplayName(client)} · ${client.email}`}
                    active={clientId === client.id}
                    onPress={() => setClientId(client.id)}
                  />
                ))}
              </ScrollView>
            </>
          )
        ) : (
          <Input
            value={customEmail}
            onChangeText={setCustomEmail}
            placeholder="name@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
        <FieldError message={touched ? errors.toEmail : undefined} />

        <FieldLabel required>Subject</FieldLabel>
        <Input value={subject} onChangeText={setSubject} placeholder="Email subject" />
        <FieldError message={touched ? errors.subject : undefined} />

        <FieldLabel required>Message</FieldLabel>
        <TextArea value={body} onChangeText={setBody} placeholder="Write your message…" />
        <FieldError message={touched ? errors.body : undefined} />

        <Button label="Send email" onPress={handleSubmit} loading={mutation.isPending} />
        <Button label="Cancel" onPress={onCancel} variant="secondary" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
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
    gap: spacing.xs,
  },
  intro: {
    ...typography.caption,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  emptyClients: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  emptyClientsText: {
    ...typography.subheading,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    maxWidth: 260,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primaryForeground,
  },
});
