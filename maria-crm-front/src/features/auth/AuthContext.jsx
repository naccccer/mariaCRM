import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { AuthContext } from './authStore';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiClient
      .get('/auth/me')
      .then((data) => {
        if (!mounted) {
          return;
        }

        setUser(data.user);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setUser(null);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await apiClient.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      setUser(null);
    }
  };

  const hasPermission = useCallback(
    (permissionCode) => {
      if (!user) {
        return false;
      }

      return user.permissions?.includes(permissionCode) ?? false;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      hasPermission,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
