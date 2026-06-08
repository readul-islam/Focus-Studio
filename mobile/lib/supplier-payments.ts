import { Linking } from 'react-native';
import { api } from '@/lib/api';
import { studioWebPath } from '@/lib/web';

export async function createSupplierPaymentCheckout(input: {
  procurementId: number;
  projectId: string;
}): Promise<string> {
  const response = await api.post<{ url: string }>('/supplier_portal/studio/payments/checkout/', {
    procurement_id: input.procurementId,
    success_url: studioWebPath(`/projects/${input.projectId}/procurement?supplier_paid=1`),
    cancel_url: studioWebPath(`/projects/${input.projectId}/procurement?supplier_paid=0`),
  });
  return response.data.url;
}

export async function openSupplierPaymentCheckout(input: {
  procurementId: number;
  projectId: string;
}): Promise<void> {
  const url = await createSupplierPaymentCheckout(input);
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('Cannot open payment checkout URL');
  }
  await Linking.openURL(url);
}
