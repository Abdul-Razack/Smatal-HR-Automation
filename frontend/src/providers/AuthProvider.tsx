'use client';

import * as React from 'react';
import { useAuthStore } from '@/store';
import { authApi } from '@/modules/auth/api/auth.api';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null;
};

export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
});

export function AuthProvider({ children }: { children: any }) {
  const { accessToken, setUser, clear, status } = useAuthStore();
  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!accessToken) {
      // No token — mark unauthenticated immediately
      clear();
      return;
    }

    // We have a stored token — verify it with the backend
    authApi
      .getMe()
      .then((user: any) => {
        setUser(
          {
            id: user.id,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
            email: user.email,
            companyId: user.companyId,
            isCommon: user.isCommon,
          },
          user.roles || [],
          user.permissions || [],
          user.accessibleCompanies || [],
        );
      })
      .catch(() => {
        // Token is invalid/expired — clear everything
        clear();
      });
  }, [accessToken, setUser, clear]);

  const isAuthenticated = status === 'authenticated';
  const currentUser = useAuthStore.getState().currentUser;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user: currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
