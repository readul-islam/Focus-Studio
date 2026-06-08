import type { TwoFactorStatus } from '@focuspilot/shared';
import { api } from '@/lib/api';

export async function fetchTwoFactorStatus(): Promise<TwoFactorStatus> {
  const response = await api.get<TwoFactorStatus>('/user/2fa/status/');
  return response.data;
}

export async function setupTwoFactor(): Promise<{ provisioning_uri: string; secret: string }> {
  const response = await api.post<{ provisioning_uri: string; secret: string }>('/user/2fa/setup/');
  return response.data;
}

export async function confirmTwoFactor(code: string): Promise<{ backup_codes: string[] }> {
  const response = await api.post<{ backup_codes: string[]; detail?: string }>('/user/2fa/confirm/', {
    code,
  });
  return { backup_codes: response.data.backup_codes ?? [] };
}

export async function disableTwoFactor(password: string, code: string): Promise<void> {
  await api.post('/user/2fa/disable/', { password, code });
}
