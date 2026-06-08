import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { CrmContact } from '@focuspilot/shared';
import { ContactForm } from '@/components/crm/ContactForm';
import { ErrorState, LoadingInline } from '@/components/design-system';
import { contactToFormValues } from '@/lib/contact-form';
import { api } from '@/lib/api';

async function fetchContact(id: string): Promise<CrmContact> {
  const response = await api.get<CrmContact>(`/crm/clients/${id}/`);
  return response.data;
}

export default function EditContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['crm/clients', id],
    queryFn: () => fetchContact(String(id)),
    enabled: Boolean(id),
  });

  if (isLoading && !data) {
    return <LoadingInline />;
  }

  if (isError && !data) {
    return <ErrorState title="Couldn't load contact" onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState title="Contact not found" />;
  }

  return (
    <ContactForm
        contactId={data.id}
        initialValues={contactToFormValues(data)}
        onSuccess={() => router.back()}
        onCancel={() => router.back()}
      />
  );
}
