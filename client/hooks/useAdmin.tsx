import useUser from './useUser';

export function useAdmin() {
  const { user, isLoading: userLoading } = useUser();

  return {
    isAdmin: user?.role === 'admin',
    user,
    userLoading,
  };
}