import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrmContact, StudioUser } from '@focuspilot/shared';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { FilterChips } from '@/components/design-system';
import { Button, Input, TextArea } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { contactDisplayName } from '@/lib/crm';
import { hapticSuccess } from '@/lib/haptics';
import {
  buildProjectPayload,
  buildProjectUpdatePayload,
  DEFAULT_PROJECT_FORM,
  hasProjectFormErrors,
  PROJECT_TYPE_OPTIONS,
  validateProjectForm,
  type ProjectFormErrors,
  type ProjectFormValues,
} from '@/lib/project-form';
import { getApiErrorMessage } from '@/lib/api-errors';
import { studioUserLabel } from '@/lib/task-form';
import { api } from '@/lib/api';
import { routes } from '@/lib/routes';

type ProjectFormProps = {
  projectId?: number;
  initialValues?: ProjectFormValues;
  initialClientId?: number | null;
  onSuccess: (projectId: number) => void;
  onCancel: () => void;
};

async function fetchClients(): Promise<CrmContact[]> {
  const response = await api.get<CrmContact[]>('/crm/studio-clients/');
  return response.data;
}

async function fetchStudioUsers(studioId: number): Promise<StudioUser[]> {
  const response = await api.get<StudioUser[]>('/user/studio-users/', {
    params: { studio_id: studioId },
  });
  return response.data;
}

async function seedDefaultPhases(projectId: number): Promise<void> {
  await api.post(`/projects/project-phases/seed-defaults/?project_id=${projectId}`, {});
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

export function ProjectForm({
  projectId,
  initialValues,
  initialClientId,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = projectId != null;
  const [values, setValues] = useState<ProjectFormValues>(() => ({
    ...DEFAULT_PROJECT_FORM,
    ...initialValues,
    clientId: initialValues?.clientId ?? initialClientId ?? null,
  }));
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [touched, setTouched] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const clientsQuery = useQuery({
    queryKey: ['crm/studio-clients/'],
    queryFn: fetchClients,
  });

  const usersQuery = useQuery({
    queryKey: ['user/studio-users/', user?.studio?.id],
    queryFn: () => fetchStudioUsers(user!.studio!.id),
    enabled: Boolean(user?.studio?.id),
  });

  const patchValues = useCallback((patch: Partial<ProjectFormValues>) => {
    setValues(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (initialClientId) {
      patchValues({ clientId: initialClientId });
    }
  }, [initialClientId, patchValues]);

  const clients = clientsQuery.data ?? [];
  const clientQuery = clientSearch.trim().toLowerCase();
  const filteredClients = clientQuery
    ? clients.filter(client => contactDisplayName(client).toLowerCase().includes(clientQuery))
    : clients;

  const teammates = (usersQuery.data ?? []).filter(member => member.id !== user?.id);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const payload = buildProjectUpdatePayload(values, user!);
        await api.patch(`/projects/projects/${projectId}/`, payload);
        return projectId;
      }

      const payload = buildProjectPayload(values, user!);
      const response = await api.post<{ id: number }>('/projects/projects/', payload);
      const createdId = response.data.id;

      if (values.seedDefaultPhases) {
        try {
          await seedDefaultPhases(createdId);
        } catch {
          // Project was created; phases can be added from project hub later
        }
      }

      return createdId;
    },
    onSuccess: async savedId => {
      await queryClient.invalidateQueries({ queryKey: ['projects/user-projects/'] });
      await queryClient.invalidateQueries({ queryKey: ['projects/projects', String(savedId)] });
      await queryClient.invalidateQueries({ queryKey: ['projects/project-overview', String(savedId)] });
      await queryClient.invalidateQueries({ queryKey: ['projects/project-phases', savedId] });
      hapticSuccess();
      onSuccess(savedId);
    },
    onError: error => {
      Alert.alert(
        isEdit ? 'Could not save project' : 'Could not create project',
        getApiErrorMessage(error, 'Check your connection and try again.'),
      );
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    const nextErrors = validateProjectForm(values);
    setErrors(nextErrors);
    if (hasProjectFormErrors(nextErrors)) return;

    if (!user?.studio?.id) {
      Alert.alert('Studio required', 'Your account must belong to a studio to create projects.');
      return;
    }

    mutation.mutate();
  };

  const toggleAssignee = (memberId: number) => {
    const next = values.assigneeIds.includes(memberId)
      ? values.assigneeIds.filter(id => id !== memberId)
      : [...values.assigneeIds, memberId];
    patchValues({ assigneeIds: next });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          {isEdit
            ? 'Update project essentials. Addresses, budget, and templates remain on the web app.'
            : 'Create a project with the essentials. Add addresses, budget, and templates on the web app later.'}
        </Text>

        <FieldLabel required>Project name</FieldLabel>
        <Input
          value={values.name}
          onChangeText={name => patchValues({ name })}
          placeholder="e.g. Chelsea Penthouse Renovation"
          autoFocus
          maxLength={200}
        />
        <FieldError message={touched ? errors.name : undefined} />

        <FieldLabel required>Type</FieldLabel>
        <FilterChips
          options={PROJECT_TYPE_OPTIONS}
          value={values.projectType}
          onChange={projectType => patchValues({ projectType })}
        />
        <FieldError message={touched ? errors.projectType : undefined} />

        <FieldLabel required>Client</FieldLabel>
        {clientsQuery.isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : clients.length === 0 ? (
          <View style={styles.emptyClients}>
            <Text style={styles.emptyClientsText}>No clients in your studio yet.</Text>
            <Text style={styles.hint}>Add a client to link them to this project.</Text>
            <Button
              label="Add client"
              variant="secondary"
              onPress={() => router.push(routes.contactNewForProject)}
            />
          </View>
        ) : (
          <>
            <View style={styles.clientToolbar}>
              <Input
                value={clientSearch}
                onChangeText={setClientSearch}
                placeholder="Search clients…"
                leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
                style={styles.clientSearch}
              />
              <Pressable
                onPress={() => router.push(routes.contactNewForProject)}
                style={({ pressed }) => [styles.addClientLink, pressed && styles.addClientLinkPressed]}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.clay} />
                <Text style={styles.addClientText}>New</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {filteredClients.map(client => {
                const label = contactDisplayName(client);
                return (
                  <Chip
                    key={client.id}
                    label={label}
                    active={values.clientId === client.id}
                    onPress={() => patchValues({ clientId: client.id })}
                  />
                );
              })}
            </ScrollView>
            {filteredClients.length === 0 ? (
              <Text style={styles.hint}>No clients match your search.</Text>
            ) : null}
          </>
        )}
        <FieldError message={touched ? errors.client : undefined} />

        <FieldLabel>Description</FieldLabel>
        <TextArea
          value={values.description}
          onChangeText={description => patchValues({ description })}
          placeholder="Brief scope or objectives…"
        />

        <DatePickerField
          label="Start date"
          value={values.startDate}
          onChange={startDate => patchValues({ startDate })}
          error={touched ? errors.startDate ?? errors.dates : undefined}
          maximumDate={values.endDate ? new Date(`${values.endDate}T12:00:00`) : undefined}
        />

        <DatePickerField
          label="End date"
          value={values.endDate}
          onChange={endDate => patchValues({ endDate })}
          error={touched ? errors.endDate ?? errors.dates : undefined}
          minimumDate={values.startDate ? new Date(`${values.startDate}T12:00:00`) : undefined}
        />

        <FieldLabel>Team</FieldLabel>
        <Text style={styles.hint}>You are always included. Tap teammates to add them.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {user ? <Chip label={`${studioUserLabel(user)} (you)`} active disabled /> : null}
          {teammates.map(member => (
            <Chip
              key={member.id}
              label={studioUserLabel(member)}
              active={values.assigneeIds.includes(member.id)}
              onPress={() => toggleAssignee(member.id)}
            />
          ))}
        </ScrollView>

        {!isEdit ? (
          <View style={styles.toggleRow}>
            <View style={styles.toggleBody}>
              <Text style={styles.toggleLabel}>Default phases</Text>
              <Text style={styles.hint}>
                Adds standard phases (Feasibility, Concept, Procurement…) so you can create tasks right away.
              </Text>
            </View>
            <Switch
              value={values.seedDefaultPhases}
              onValueChange={seedDefaultPhases => patchValues({ seedDefaultPhases })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        ) : null}

        <Button
          label={isEdit ? 'Save changes' : 'Create project'}
          onPress={handleSubmit}
          loading={mutation.isPending}
          accessibilityLabel={isEdit ? 'Save project changes' : 'Create project'}
        />
        <Button label="Cancel" onPress={onCancel} variant="secondary" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Chip({
  label,
  active,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
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
    marginBottom: spacing.xs,
  },
  loader: {
    marginVertical: spacing.sm,
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
  clientToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clientSearch: {
    flex: 1,
  },
  addClientLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  addClientLinkPressed: {
    opacity: 0.7,
  },
  addClientText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.clay,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    maxWidth: 200,
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
  chipDisabled: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primaryForeground,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  toggleBody: {
    flex: 1,
  },
  toggleLabel: {
    ...typography.subheading,
    fontSize: 15,
    marginBottom: 4,
  },
});
