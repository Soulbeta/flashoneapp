import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats, Achievement, UserProfile, WorldLevel } from '@/types/game';

const STORAGE_KEYS = {
  GAME_STATS: 'game_stats',
  ACHIEVEMENTS: 'achievements',
  USER_PROFILE: 'user_profile',
  WORLD_LEVELS: 'world_levels',
  SETTINGS: 'app_settings',
};

export async function saveGameStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving game stats:', error);
  }
}

export async function loadGameStats(): Promise<GameStats | null> {
  try {
    const stats = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATS);
    return stats ? JSON.parse(stats) : null;
  } catch (error) {
    console.error('Error loading game stats:', error);
    return null;
  }
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
}

export async function loadAchievements(): Promise<Achievement[]> {
  try {
    const achievements = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return achievements ? JSON.parse(achievements) : [];
  } catch (error) {
    console.error('Error loading achievements:', error);
    return [];
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

export async function saveWorldLevels(levels: WorldLevel[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WORLD_LEVELS, JSON.stringify(levels));
  } catch (error) {
    console.error('Error saving world levels:', error);
  }
}

export async function loadWorldLevels(): Promise<WorldLevel[]> {
  try {
    const levels = await AsyncStorage.getItem(STORAGE_KEYS.WORLD_LEVELS);
    return levels ? JSON.parse(levels) : [];
  } catch (error) {
    console.error('Error loading world levels:', error);
    return [];
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}