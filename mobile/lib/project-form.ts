import type { AppUser } from '@focuspilot/shared';
import type { ProjectHubView } from '@/lib/project-detail';
import { isValidDateString } from '@/lib/task-form';

export type ProjectType = 'RS' | 'CM' | 'HS';

export type ProjectFormValues = {
  name: string;
  projectType: ProjectType | '';
  clientId: number | null;
  description: string;
  startDate: string;
  endDate: string;
  assigneeIds: number[];
  seedDefaultPhases: boolean;
};

export type ProjectFormErrors = {
  name?: string;
  projectType?: string;
  client?: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
};

export const PROJECT_TYPE_OPTIONS: { key: ProjectType; label: string }[] = [
  { key: 'RS', label: 'Residential' },
  { key: 'CM', label: 'Commercial' },
  { key: 'HS', label: 'Hospitality' },
];

export const DEFAULT_PROJECT_FORM: ProjectFormValues = {
  name: '',
  projectType: 'RS',
  clientId: null,
  description: '',
  startDate: '',
  endDate: '',
  assigneeIds: [],
  seedDefaultPhases: true,
};

export function validateProjectForm(values: ProjectFormValues): ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'Project name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 200) {
    errors.name = 'Name must be 200 characters or fewer';
  }

  if (!values.projectType) {
    errors.projectType = 'Select a project type';
  }

  if (!values.clientId) {
    errors.client = 'Select a client';
  }

  if (values.startDate && !isValidDateString(values.startDate)) {
    errors.startDate = 'Use YYYY-MM-DD';
  }
  if (values.endDate && !isValidDateString(values.endDate)) {
    errors.endDate = 'Use YYYY-MM-DD';
  }

  if (
    values.startDate &&
    values.endDate &&
    isValidDateString(values.startDate) &&
    isValidDateString(values.endDate) &&
    values.startDate > values.endDate
  ) {
    errors.dates = 'Start date must be on or before end date';
  }

  return errors;
}

export function hasProjectFormErrors(errors: ProjectFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildProjectPayload(values: ProjectFormValues, user: AppUser): Record<string, unknown> {
  const assigneeIds = [...new Set([...(user.id ? [user.id] : []), ...values.assigneeIds])];

  return {
    project_name: values.name.trim(),
    project_type: values.projectType,
    project_status: 'AC',
    project_description: values.description.trim(),
    start_date: values.startDate || null,
    end_date: values.endDate || null,
    client: values.clientId,
    studio: user.studio?.id ?? null,
    assignees: assigneeIds,
  };
}

export function hubProjectToFormValues(project: ProjectHubView): ProjectFormValues {
  const assigneeIds = project.assignees.map(member => member.id);

  return {
    name: project.name,
    projectType: (project.projectTypeCode as ProjectType) || 'RS',
    clientId: project.clientId ?? null,
    description: project.description ?? '',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    assigneeIds,
    seedDefaultPhases: false,
  };
}

export function buildProjectUpdatePayload(values: ProjectFormValues, user: AppUser): Record<string, unknown> {
  const payload = buildProjectPayload(values, user);
  delete payload.project_status;
  delete payload.studio;
  return payload;
}
