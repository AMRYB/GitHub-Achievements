import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GitHubProfile, UserAchievementProgress, SyncResult } from '@/types';
import * as storage from '@/services/storage';
import { runSync } from '@/services/sync';

interface AuthContextType {
  token: string | null;
  profile: GitHubProfile | null;
  progress: UserAchievementProgress[];
  lastSync: SyncResult | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  syncError: string | null;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  sync: (overrideToken?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  profile: null,
  progress: [],
  lastSync: null,
  isAuthenticated: false,
  isLoading: true,
  isSyncing: false,
  syncError: null,
  setToken: async () => {},
  logout: async () => {},
  sync: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [progress, setProgress] = useState<UserAchievementProgress[]>([]);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load stored data on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await storage.getAllData();
        if (data.token) setTokenState(data.token);
        if (data.profile) setProfile(data.profile);
        if (data.progress) setProgress(data.progress);
        if (data.lastSync) setLastSync(data.lastSync);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setToken = async (newToken: string) => {
    await storage.saveToken(newToken);
    setTokenState(newToken);
    setSyncError(null);
  };

  const logout = async () => {
    await storage.clearAllData();
    setTokenState(null);
    setProfile(null);
    setProgress([]);
    setLastSync(null);
    setSyncError(null);
  };

  const sync = async (overrideToken?: string) => {
    const currentToken = overrideToken || token;
    if (!currentToken) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const result = await runSync(currentToken);
      setProfile(result.profile);
      setLastSync(result);
      const updatedProgress = await storage.getProgress();
      setProgress(updatedProgress);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Sync failed';
      setSyncError(msg);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        progress,
        lastSync,
        isAuthenticated: !!token,
        isLoading,
        isSyncing,
        syncError,
        setToken,
        logout,
        sync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
