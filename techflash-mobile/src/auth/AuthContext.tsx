import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '../types/user';
import * as authApi from '../api/authApi';
import { setStoredToken, getStoredToken } from '../api/client';
import {
  getStoredUserJson,
  setStoredUserJson,
  isTokenExpired,
} from './session';

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  setSessionFromAuthPayload: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getStoredToken();
        const raw = await getStoredUserJson();
        if (!token || isTokenExpired(token)) {
          await setStoredToken(null);
          await setStoredUserJson(null);
          if (!cancelled) setUser(null);
          return;
        }
        if (raw) {
          const parsed = JSON.parse(raw) as User;
          if (!cancelled) setUser(parsed);
        } else {
          await setStoredToken(null);
          if (!cancelled) setUser(null);
        }
      } catch {
        await setStoredToken(null);
        await setStoredUserJson(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async (token: string, nextUser: User) => {
    await setStoredToken(token);
    await setStoredUserJson(JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: u } = await authApi.login(email, password);
      await persistSession(token, u);
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload: authApi.RegisterPayload) => {
      const { token, user: u } = await authApi.register(payload);
      await persistSession(token, u);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    await setStoredToken(null);
    await setStoredUserJson(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      setSessionFromAuthPayload: persistSession,
      logout,
    }),
    [user, ready, login, register, persistSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
