import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getCurrentUser, loginUser, logoutUser, registerUser } from '@/services/storage';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const current = await getCurrentUser();
    setUser(current);
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const loggedUser = await loginUser(email, password);
        setUser(loggedUser);
      },
      register: async (input) => {
        const newUser = await registerUser(input);
        setUser(newUser);
      },
      logout: async () => {
        await logoutUser();
        setUser(null);
      },
      refreshUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
