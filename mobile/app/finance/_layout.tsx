import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '@/lib/stack-screen-options';

export default function FinanceLayout() {
  return (
    <Stack screenOptions={sharedStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Finance' }} />
      <Stack.Screen name="invoice/[id]" options={{ title: 'Invoice', headerBackTitle: 'Finance' }} />
      <Stack.Screen name="purchase-order/[id]" options={{ title: 'Purchase order', headerBackTitle: 'Finance' }} />
    </Stack>
  );
}
