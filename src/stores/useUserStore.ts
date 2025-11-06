import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ProgressData } from '../types';

interface UserState {
  profile: UserProfile | null;
  progress: ProgressData | null;
  isLoading: boolean;

  // Actions
  setProfile: (profile: UserProfile) => Promise<void>;
  updateProgress: (updates: Partial<ProgressData>) => Promise<void>;
  loadUserData: () => Promise<void>;
  clearUserData: () => Promise<void>;
}

const STORAGE_KEYS = {
  PROFILE: '@fluentai_profile',
  PROGRESS: '@fluentai_progress'
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  progress: null,
  isLoading: true,

  setProfile: async (profile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      set({ profile });
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  },

  updateProgress: async (updates) => {
    try {
      const current = get().progress;
      const updated: ProgressData = {
        ...current!,
        ...updates
      };

      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));
      set({ progress: updated });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  },

  loadUserData: async () => {
    try {
      set({ isLoading: true });

      const [profileData, progressData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.PROGRESS)
      ]);

      const profile = profileData ? JSON.parse(profileData) : null;
      const progress = progressData ? JSON.parse(progressData) : null;

      set({
        profile,
        progress,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      set({ isLoading: false });
    }
  },

  clearUserData: async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.PROFILE, STORAGE_KEYS.PROGRESS]);
      set({ profile: null, progress: null });
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }
}));
