import { api } from '@/lib/api';

export type SendEmailPayload = {
  to_email?: string;
  subject?: string;
  body: string;
  thread_id?: string;
};

export type SendEmailResult = {
  success?: boolean;
  message_id?: string;
  thread_id?: string;
  error?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export { getApiErrorMessage } from '@/lib/api-errors';

export async function sendGmailEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const formData = new FormData();
  if (payload.to_email?.trim()) {
    formData.append('to_email', payload.to_email.trim());
  }
  if (payload.subject?.trim()) {
    formData.append('subject', payload.subject.trim());
  }
  formData.append('body', payload.body);
  if (payload.thread_id?.trim()) {
    formData.append('thread_id', String(payload.thread_id).trim());
  }

  const response = await api.post<SendEmailResult>('/gmail/send/', formData);

  if (response.data.error) {
    throw new Error(response.data.error);
  }

  return response.data;
}

export function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<p>${escaped.replace(/\n/g, '<br/>')}</p>`;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function validateNewEmail(values: {
  toEmail: string;
  subject: string;
  body: string;
}): { toEmail?: string; subject?: string; body?: string } {
  const errors: { toEmail?: string; subject?: string; body?: string } = {};
  if (!isValidEmail(values.toEmail)) {
    errors.toEmail = 'Enter a valid email address';
  }
  if (!values.subject.trim()) {
    errors.subject = 'Subject is required';
  }
  if (!values.body.trim()) {
    errors.body = 'Write a message before sending';
  }
  return errors;
}

export function hasComposeErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
