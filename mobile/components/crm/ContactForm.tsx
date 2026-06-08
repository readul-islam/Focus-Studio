import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContactType } from '@focuspilot/shared';
import { FilterChips } from '@/components/design-system';
import { Button, Input } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { hapticSuccess } from '@/lib/haptics';
import {
  buildContactPayload,
  buildContactUpdatePayload,
  CONTACT_TYPE_OPTIONS,
  DEFAULT_CONTACT_FORM,
  hasContactFormErrors,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from '@/lib/contact-form';
import { getApiErrorMessage } from '@/lib/api-errors';
import { api } from '@/lib/api';

type ContactFormProps = {
  contactId?: number;
  initialValues?: ContactFormValues;
  initialContactType?: ContactType;
  onSuccess: (contactId: number) => void;
  onCancel: () => void;
};

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

export function ContactForm({
  contactId,
  initialValues,
  initialContactType,
  onSuccess,
  onCancel,
}: ContactFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = contactId != null;
  const [values, setValues] = useState<ContactFormValues>({
    ...DEFAULT_CONTACT_FORM,
    ...initialValues,
    contactType: initialValues?.contactType ?? initialContactType ?? DEFAULT_CONTACT_FORM.contactType,
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState(false);

  const patchValues = useCallback((patch: Partial<ContactFormValues>) => {
    setValues(prev => ({ ...prev, ...patch }));
  }, []);

  const isClient = values.contactType === 'CL';

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const payload = buildContactUpdatePayload(values);
        await api.patch(`/crm/clients/${contactId}/`, payload);
        return contactId;
      }

      const payload = buildContactPayload(values, user!);
      const response = await api.post<{ id: number }>('/crm/clients/', payload);
      return response.data.id;
    },
    onSuccess: async savedId => {
      await queryClient.invalidateQueries({ queryKey: ['crm/studio-contacts'] });
      await queryClient.invalidateQueries({ queryKey: ['crm/studio-clients/'] });
      await queryClient.invalidateQueries({ queryKey: ['crm/clients', String(savedId)] });
      hapticSuccess();
      onSuccess(savedId);
    },
    onError: error => {
      Alert.alert(
        isEdit ? 'Could not save contact' : 'Could not create contact',
        getApiErrorMessage(error, 'Check your connection and try again.'),
      );
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);
    if (hasContactFormErrors(nextErrors)) return;

    if (!user?.studio?.id) {
      Alert.alert('Studio required', 'Your account must belong to a studio to add contacts.');
      return;
    }

    mutation.mutate();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          {isEdit
            ? 'Update contact details. Addresses, notes, and portal access remain on the web app.'
            : 'Add the essentials now. Addresses, notes, and portal access can be managed on the web app.'}
        </Text>

        <FieldLabel required>Type</FieldLabel>
        <FilterChips
          options={CONTACT_TYPE_OPTIONS}
          value={values.contactType}
          onChange={contactType => patchValues({ contactType })}
        />
        <FieldError message={touched ? errors.contactType : undefined} />

        <FieldLabel required={!isClient}>Company</FieldLabel>
        <Input
          value={values.companyName}
          onChangeText={companyName => patchValues({ companyName })}
          placeholder={isClient ? 'Optional for clients' : 'Company or trading name'}
          autoFocus
        />
        <FieldError message={touched ? errors.companyName : undefined} />

        <FieldLabel required={!isClient}>First name</FieldLabel>
        <Input
          value={values.name}
          onChangeText={name => patchValues({ name })}
          placeholder="Contact first name"
        />
        <FieldError message={touched ? errors.name : undefined} />

        <FieldLabel>Last name</FieldLabel>
        <Input
          value={values.surname}
          onChangeText={surname => patchValues({ surname })}
          placeholder="Optional"
        />

        <FieldLabel>Email</FieldLabel>
        <Input
          value={values.email}
          onChangeText={email => patchValues({ email })}
          placeholder="name@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FieldError message={touched ? errors.email : undefined} />

        <FieldLabel>Phone</FieldLabel>
        <Input
          value={values.phone}
          onChangeText={phone => patchValues({ phone })}
          placeholder="Optional"
          keyboardType="phone-pad"
        />

        <Button
          label={isEdit ? 'Save changes' : 'Create contact'}
          onPress={handleSubmit}
          loading={mutation.isPending}
          accessibilityLabel={isEdit ? 'Save contact changes' : 'Create contact'}
        />
        <Button label="Cancel" onPress={onCancel} variant="secondary" />
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
});
