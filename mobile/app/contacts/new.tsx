import { Stack, router, useLocalSearchParams } from 'expo-router';
import type { ContactType } from '@focuspilot/shared';
import { ContactForm } from '@/components/crm/ContactForm';
import { routes } from '@/lib/routes';

export default function NewContactScreen() {
  const params = useLocalSearchParams<{ returnTo?: string; contactType?: string }>();

  const initialContactType =
    params.contactType === 'CL' || params.contactType === 'SP' || params.contactType === 'CN'
      ? (params.contactType as ContactType)
      : undefined;

  const handleSuccess = (contactId: number) => {
    if (params.returnTo === 'project-new') {
      router.replace(`/project/new?clientId=${contactId}` as typeof routes.projectNew);
      return;
    }
    router.replace(`/contacts/${contactId}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New contact', presentation: 'modal' }} />
      <ContactForm
        initialContactType={initialContactType}
        onSuccess={handleSuccess}
        onCancel={() => router.back()}
      />
    </>
  );
}
