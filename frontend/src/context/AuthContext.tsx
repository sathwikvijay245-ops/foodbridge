import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DemoUser } from '../types';
import { api, setToken, clearToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  backendReady: boolean;
  demoUsers: DemoUser[];
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: (userId: number) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('foodbridge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendReady, setBackendReady] = useState<boolean>(false);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  // Wake up the Render backend immediately on app load (prevents cold-start delay on login)
  useEffect(() => {
    const wakeBackend = async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const res = await fetch(
            (import.meta.env.VITE_API_URL
              ? `${import.meta.env.VITE_API_URL}/api/health`
              : '/api/health'),
            { signal: AbortSignal.timeout(15000) }
          );
          if (res.ok) {
            setBackendReady(true);
            return;
          }
        } catch {
          // server still sleeping — wait 4 seconds and retry
          await new Promise(r => setTimeout(r, 4000));
        }
      }
      // After all retries, mark ready anyway so user can still try
      setBackendReady(true);
    };
    wakeBackend();
  }, []);

  // Load demo users list for quick-switching in UI
  useEffect(() => {
    if (!backendReady) return;
    api.getDemoUsers()
      .then(users => setDemoUsers(users))
      .catch(err => console.error("Could not fetch demo users:", err));
  }, [backendReady]);

  // Fetch current user if token exists
  const refreshUser = async () => {
    try {
      if (token) {
        const u = await api.getMe();
        setUser(u);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn("Session expired or invalid:", err);
      clearToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (backendReady) refreshUser();
  }, [token, backendReady]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (userId: number) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(userId);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, token, isLoading, backendReady,
        demoUsers, login, register, demoLogin, logout, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
