import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppUser } from '@focuspilot/shared';
import {
  fetchCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  verifyTwoFactor,
} from '@focuspilot/api-client';
import { clearPersistedQueryCache } from '@/lib/query-persistence';
import { api, setUnauthorizedHandler } from '@/lib/api';
import { hasStoredSession, secureTokenStorage } from '@/lib/token-storage';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requires2fa: boolean; email?: string }>;
  verify2fa: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    hasStoredSession().then(stored => {
      setHasSession(stored);
      setSessionChecked(true);
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setHasSession(false);
      void clearPersistedQueryCache();
    });
  }, []);

  const { data: user, isLoading: userLoading, refetch } = useQuery({
    queryKey: ['user/self/'],
    queryFn: () => fetchCurrentUser(api),
    enabled: sessionChecked && hasSession,
    retry: false,
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading: !sessionChecked || (hasSession && userLoading),
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const result = await apiLogin(api, secureTokenStorage, email, password);
        if (result.requires_2fa) {
          return { requires2fa: true, email: result.email };
        }
        setHasSession(true);
        await refetch();
        return { requires2fa: false };
      },
      verify2fa: async (email, code) => {
        await verifyTwoFactor(api, secureTokenStorage, email, code);
        setHasSession(true);
        await refetch();
      },
      logout: async () => {
        await apiLogout(api, secureTokenStorage);
        setHasSession(false);
        await clearPersistedQueryCache();
      },
      refreshUser: async () => {
        await refetch();
      },
    }),
    [user, sessionChecked, hasSession, userLoading, refetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
