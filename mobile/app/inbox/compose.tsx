import { Stack, router } from 'expo-router';
import { ComposeEmailForm } from '@/components/inbox/ComposeEmailForm';

export default function ComposeEmailScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New email', presentation: 'modal' }} />
      <ComposeEmailForm
        onSuccess={threadId => {
          if (threadId) {
            router.replace(`/inbox/${encodeURIComponent(threadId)}`);
            return;
          }
          router.replace('/inbox');
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
