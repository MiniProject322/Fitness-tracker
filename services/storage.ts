import { AuthState, AppEntry, UserProfile } from '../types';

const STORAGE_KEYS = {
  AUTH: 'ironpulse_auth',
  ENTRIES: 'ironpulse_entries',
  USERS: 'ironpulse_users',
};

interface StoredUser {
  profile: UserProfile;
  password: string;
}

export const StorageService = {
  // --- Auth Session (Current Login State) ---
  saveAuth: (auth: AuthState) => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  },

  getAuth: (): AuthState => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : { isAuthenticated: false, user: null };
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  // --- User Registry (Persistent Accounts) ---
  getRegistry: (): Record<string, StoredUser> => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : {};
  },

  registerUser: (profile: UserProfile, password: string): boolean => {
    const registry = StorageService.getRegistry();
    if (registry[profile.username]) {
      return false; // Username taken
    }
    
    registry[profile.username] = { profile, password };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registry));
    return true;
  },

  loginUser: (username: string, password: string): UserProfile | null => {
    const registry = StorageService.getRegistry();
    const user = registry[username];
    
    // Simple check (in real app, compare hashes)
    if (user && user.password === password) {
      return user.profile;
    }
    return null;
  },

  updateUser: (profile: UserProfile) => {
    const registry = StorageService.getRegistry();
    const user = registry[profile.username];
    if (user) {
      user.profile = profile;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registry));
    }
  },

  // --- Data Entries ---
  getEntries: (username: string): AppEntry[] => {
    const data = localStorage.getItem(`${STORAGE_KEYS.ENTRIES}_${username}`);
    return data ? JSON.parse(data) : [];
  },

  saveEntry: (username: string, entry: AppEntry) => {
    const entries = StorageService.getEntries(username);
    const newEntries = [entry, ...entries];
    localStorage.setItem(`${STORAGE_KEYS.ENTRIES}_${username}`, JSON.stringify(newEntries));
    return newEntries;
  },

  clearEntries: (username: string) => {
    localStorage.removeItem(`${STORAGE_KEYS.ENTRIES}_${username}`);
  }
};