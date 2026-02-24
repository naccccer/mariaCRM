import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { AuthContext } from './authStore';

const authQueryKey = ['auth', 'me'];

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: authQueryKey,
    queryFn: async () => {
      const data = await apiClient.get('/auth/me');
      return data?.user || null;
    },
    retry: false,
    staleTime: 60_000,
  });

  const login = useCallback(
    async (email, password) => {
      const data = await apiClient.post('/auth/login', { email, password });

      if (!data?.user) {
        throw new Error('ورود ناموفق بود.');
      }

      queryClient.setQueryData(authQueryKey, data.user);
      return data.user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      queryClient.setQueryData(authQueryKey, null);
      queryClient.invalidateQueries();
    }
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authQueryKey });
  }, [queryClient]);

  const hasPermission = useCallback(
    (permissionCode) => {
      if (!permissionCode) {
        return true;
      }

      return sessionQuery.data?.permissions?.includes(permissionCode) ?? false;
    },
    [sessionQuery.data?.permissions],
  );

  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return true;
      }

      return permissions.some((permission) => hasPermission(permission));
    },
    [hasPermission],
  );

  const value = useMemo(
    () => ({
      user: sessionQuery.data || null,
      loading: sessionQuery.isLoading,
      isAuthenticated: Boolean(sessionQuery.data),
      login,
      logout,
      refreshSession,
      hasPermission,
      hasAnyPermission,
    }),
    [hasAnyPermission, hasPermission, login, logout, refreshSession, sessionQuery.data, sessionQuery.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
