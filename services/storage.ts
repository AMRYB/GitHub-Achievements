import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredUserData, UserAchievementProgress, SyncResult, GitHubProfile, SyncJob } from '@/types';

const STORAGE_KEYS = {
  TOKEN: 'github_pat',
  PROFILE: 'github_profile',
  PROGRESS: 'achievement_progress',
  LAST_SYNC: 'last_sync',
  SYNC_HISTORY: 'sync_history',
  THEME: 'theme_preference',
} as const;

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export async function saveProfile(profile: GitHubProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export async function getProfile(): Promise<GitHubProfile | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function saveProgress(progress: UserAchievementProgress[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

export async function getProgress(): Promise<UserAchievementProgress[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
  return data ? JSON.parse(data) : [];
}

export async function saveLastSync(syncResult: SyncResult): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify(syncResult));
}

export async function getLastSync(): Promise<SyncResult | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  return data ? JSON.parse(data) : null;
}

export async function saveSyncHistory(jobs: SyncJob[]): Promise<void> {
  const last10 = jobs.slice(-10); // keep last 10 only
  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_HISTORY, JSON.stringify(last10));
}

export async function getSyncHistory(): Promise<SyncJob[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_HISTORY);
  return data ? JSON.parse(data) : [];
}

export async function saveTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export async function getTheme(): Promise<'light' | 'dark' | 'system'> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
  return (data as 'light' | 'dark' | 'system') || 'system';
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}

export async function getAllData(): Promise<StoredUserData> {
  const [token, profile, progress, lastSync, syncHistory] = await Promise.all([
    getToken(),
    getProfile(),
    getProgress(),
    getLastSync(),
    getSyncHistory(),
  ]);
  return {
    token,
    profile,
    progress,
    lastSync,
    syncHistory,
  };
}
