import { fetchData } from '@/lib/Api';
import { useQuery } from '@tanstack/react-query';

export type UserRole = 'admin' | 'manager' | 'member';

export interface AppUser {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  phone_number?: string;
  profile_picture?: string;
  photoURL?: string;
  title?: string;
  role: UserRole;
  studio?: { id: number; name: string };
  permissions?: string[];
  [key: string]: unknown;
}

const useUser = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user/self/'],
    queryFn: () => fetchData('user/self/'),
    enabled,
  });

  return {
    user: isLoading ? null : (data as AppUser | null),
    isLoading,
  };
};

export default useUser;
