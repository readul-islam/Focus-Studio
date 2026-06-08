import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import type { ProjectListItem, StudioUser } from '@focuspilot/shared';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { FilterChips } from '@/components/design-system';
import { Button, Input, TextArea } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTaskPhases } from '@/hooks/useTaskPhases';
import {
  buildTaskPayload,
  DEFAULT_TASK_FORM,
  hasTaskFormErrors,
  studioUserLabel,
  type TaskFormErrors,
  type TaskFormValues,
  type TaskPriority,
  validateTaskForm,
} from '@/lib/task-form';
import { TASK_STATUS_OPTIONS, priorityLabel } from '@/lib/task-utils';
import { api } from '@/lib/api';

const priorityOptions: { key: TaskPriority; label: string }[] = [
  { key: 'L', label: 'Low' },
  { key: 'M', label: 'Medium' },
  { key: 'H', label: 'High' },
];

type TaskFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<TaskFormValues>;
  taskId?: number;
  existingSubtaskIds?: number[];
  onSuccess: (taskId: number) => void;
  onCancel: () => void;
};

async function fetchProjects(): Promise<ProjectListItem[]> {
  const response = await api.get<ProjectListItem[]>('/projects/user-projects/');
  return response.data;
}

async function fetchStudioUsers(studioId: number): Promise<StudioUser[]> {
  const response = await api.get<StudioUser[]>('/user/studio-users/', {
    params: { studio_id: studioId },
  });
  return response.data;
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

export function TaskForm({
  mode,
  initialValues,
  taskId,
  existingSubtaskIds = [],
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<TaskFormValues>({ ...DEFAULT_TASK_FORM, ...initialValues });
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [touched, setTouched] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  useEffect(() => {
    setValues({ ...DEFAULT_TASK_FORM, ...initialValues });
    setErrors({});
    setTouched(false);
  }, [initialValues, mode, taskId]);

  const projectsQuery = useQuery({
    queryKey: ['projects/user-projects/'],
    queryFn: fetchProjects,
  });

  const usersQuery = useQuery({
    queryKey: ['user/studio-users', user?.studio?.id],
    queryFn: () => fetchStudioUsers(user!.studio!.id),
    enabled: Boolean(user?.studio?.id),
  });

  const handleAutoPhase = useCallback((phaseId: number) => {
    setValues(prev => (prev.phaseId ? prev : { ...prev, phaseId }));
  }, []);

  const phasesQuery = useTaskPhases(values.projectId, handleAutoPhase);

  const projects = projectsQuery.data ?? [];
  const studioUsers = (usersQuery.data ?? []).filter(u => u.id !== user?.id);

  const patchValues = (patch: Partial<TaskFormValues>) => {
    setValues(prev => {
      const next = { ...prev, ...patch };
      if (patch.projectId !== undefined && patch.projectId !== prev.projectId) {
        next.phaseId = null;
      }
      return next;
    });
  };

  const toggleAssignee = (id: number) => {
    setValues(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(id)
        ? prev.assigneeIds.filter(item => item !== id)
        : [...prev.assigneeIds, id],
    }));
  };

  const addPendingSubtask = () => {
    const text = subtaskDraft.trim();
    if (!text) return;
    setValues(prev => ({ ...prev, pendingSubtasks: [...prev.pendingSubtasks, text] }));
    setSubtaskDraft('');
  };

  const removePendingSubtask = (index: number) => {
    setValues(prev => ({
      ...prev,
      pendingSubtasks: prev.pendingSubtasks.filter((_, i) => i !== index),
    }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not signed in');

      const payload = buildTaskPayload(values, user, {
        taskId,
        subtaskIds: existingSubtaskIds,
        state: 'AC',
      });

      if (mode === 'edit' && taskId) {
        await api.patch(`/task/tasks/${taskId}/`, payload);
        return { id: taskId };
      }

      const response = await api.post<{ id: number }>('/task/tasks/', payload);
      const createdId = response.data.id;

      for (let index = 0; index < values.pendingSubtasks.length; index += 1) {
        const text = values.pendingSubtasks[index];
        await api.post('/task/subtasks/', {
          subtask: text,
          order: index + 1,
          studio: user.studio?.id ?? null,
          is_completed: false,
          task: createdId,
        });
      }

      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks-project'] });
      queryClient.invalidateQueries({ queryKey: ['user/dashboard/'] });
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ['task/tasks', String(taskId)] });
      }
      onSuccess(data.id);
    },
    onError: () => {
      Alert.alert(
        mode === 'edit' ? 'Could not save task' : 'Could not create task',
        'Please check your connection and try again.',
      );
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    const nextErrors = validateTaskForm(values);
    setErrors(nextErrors);
    if (hasTaskFormErrors(nextErrors)) return;

    if (!user?.studio?.id) {
      Alert.alert('Studio required', 'Your account must belong to a studio to save tasks.');
      return;
    }

    mutation.mutate();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FieldLabel required>Title</FieldLabel>
        <Input
          value={values.title}
          onChangeText={title => patchValues({ title })}
          placeholder="What needs to be done?"
          autoFocus={mode === 'create'}
          maxLength={60}
        />
        <FieldError message={touched ? errors.title : undefined} />
        {values.title.length > 0 ? (
          <Text style={styles.charCount}>{values.title.length}/60</Text>
        ) : null}

        <FieldLabel>Description</FieldLabel>
        <TextArea
          value={values.description}
          onChangeText={description => patchValues({ description })}
          placeholder="Add details, links, or context…"
        />

        <FieldLabel>Status</FieldLabel>
        <FilterChips
          options={TASK_STATUS_OPTIONS.map(s => ({ key: s.code, label: s.label }))}
          value={values.status}
          onChange={status => patchValues({ status })}
        />

        <FieldLabel>Priority</FieldLabel>
        <FilterChips options={priorityOptions} value={values.priority} onChange={priority => patchValues({ priority })} />

        <FieldLabel>Project</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <Chip
            label="None"
            active={values.projectId === null}
            onPress={() => patchValues({ projectId: null, phaseId: null })}
          />
          {projects.map(project => {
            const name = project.project_name ?? project.name;
            return (
              <Chip
                key={project.id}
                label={name}
                active={values.projectId === project.id}
                onPress={() => patchValues({ projectId: project.id, phaseId: null })}
              />
            );
          })}
        </ScrollView>

        {values.projectId ? (
          <>
            <FieldLabel required>Phase</FieldLabel>
            {phasesQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.phaseLoader} />
            ) : phasesQuery.phases.length === 0 ? (
              <View style={styles.phaseEmpty}>
                <Text style={styles.phaseEmptyText}>No phases on this project yet.</Text>
                <Button
                  label="Add default phases"
                  variant="secondary"
                  onPress={async () => {
                    const phases = await phasesQuery.seedPhases();
                    if (phases[0]) patchValues({ phaseId: phases[0].id });
                  }}
                />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {phasesQuery.phases.map(phase => (
                  <Chip
                    key={phase.id}
                    label={phase.name}
                    active={values.phaseId === phase.id}
                    onPress={() => patchValues({ phaseId: phase.id })}
                  />
                ))}
              </ScrollView>
            )}
            <FieldError message={touched ? errors.phase : undefined} />
          </>
        ) : null}

        <DatePickerField
          label="Start date"
          value={values.startDate}
          onChange={startDate => patchValues({ startDate })}
          error={touched ? errors.startDate ?? errors.dates : undefined}
          maximumDate={values.dueDate ? new Date(`${values.dueDate}T12:00:00`) : undefined}
        />

        <DatePickerField
          label="Due date"
          value={values.dueDate}
          onChange={dueDate => patchValues({ dueDate })}
          error={touched ? errors.dueDate ?? errors.dates : undefined}
          minimumDate={values.startDate ? new Date(`${values.startDate}T12:00:00`) : undefined}
        />

        <FieldLabel>Assignees</FieldLabel>
        <Text style={styles.hint}>You are always included. Tap teammates to add them.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {user ? (
            <Chip label={`${studioUserLabel(user)} (you)`} active disabled />
          ) : null}
          {studioUsers.map(member => (
            <Chip
              key={member.id}
              label={studioUserLabel(member)}
              active={values.assigneeIds.includes(member.id)}
              onPress={() => toggleAssignee(member.id)}
            />
          ))}
        </ScrollView>

        {mode === 'create' ? (
          <>
            <FieldLabel>Subtasks</FieldLabel>
            <View style={styles.subtaskRow}>
              <Input
                value={subtaskDraft}
                onChangeText={setSubtaskDraft}
                placeholder="Add a subtask"
                style={styles.subtaskInput}
                onSubmitEditing={addPendingSubtask}
              />
              <Pressable onPress={addPendingSubtask} style={styles.subtaskAdd}>
                <Ionicons name="add" size={20} color={colors.primaryForeground} />
              </Pressable>
            </View>
            {values.pendingSubtasks.map((text, index) => (
              <View key={`${text}-${index}`} style={styles.pendingSubtask}>
                <Text style={styles.pendingSubtaskText}>{text}</Text>
                <Pressable onPress={() => removePendingSubtask(index)} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </>
        ) : null}

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {priorityLabel(values.priority)} priority
            {values.projectId
              ? ` · ${projects.find(p => p.id === values.projectId)?.project_name ?? 'Project'}`
              : ' · No project'}
          </Text>
        </View>

        <Button
          label={mode === 'edit' ? 'Save changes' : 'Create task'}
          onPress={handleSubmit}
          loading={mutation.isPending}
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
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    maxWidth: 180,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    opacity: 0.85,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primaryForeground,
  },
  phaseLoader: {
    alignSelf: 'flex-start',
    marginVertical: spacing.sm,
  },
  phaseEmpty: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  phaseEmptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subtaskInput: {
    flex: 1,
  },
  subtaskAdd: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingSubtask: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  pendingSubtaskText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginRight: spacing.sm,
  },
  summary: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
