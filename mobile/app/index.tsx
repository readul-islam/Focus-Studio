import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/ui';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
