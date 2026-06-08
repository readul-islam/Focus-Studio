import { api } from '@/lib/api';
import type { TaskAttachment } from '@focuspilot/shared';

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

export async function uploadTaskAttachments(taskId: number, files: UploadFile[]): Promise<TaskAttachment[]> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
  });

  const response = await api.post<TaskAttachment[]>(`/task/tasks/${taskId}/attachments/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function uploadProjectBanner(projectId: number, file: UploadFile): Promise<void> {
  const formData = new FormData();
  formData.append('project_banner', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  await api.patch(`/projects/projects/${projectId}/`, formData);
}
