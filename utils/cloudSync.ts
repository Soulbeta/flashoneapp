import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats, Achievement, UserProfile } from '@/types/game';

interface SyncData {
  gameStats: GameStats;
  achievements: Achievement[];
  userProfile: UserProfile;
  lastSynced: Date;
}

const SYNC_ENDPOINT = 'https://api.flashanzan.app/sync'; // Replace with actual endpoint
const SYNC_KEY = 'last_sync_timestamp';

export class CloudSyncService {
  private static instance: CloudSyncService;
  private isOnline: boolean = true;
  private syncQueue: SyncData[] = [];

  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  async initialize() {
    // Monitor network connectivity
    this.setupNetworkListener();
    
    // Auto-sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, 5 * 60 * 1000);
  }

  private setupNetworkListener() {
    // In a real implementation, you'd use @react-native-community/netinfo
    // For now, we'll simulate network detection
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async syncData(): Promise<boolean> {
    if (!this.isOnline) {
      console.log('Offline - queueing sync for later');
      return false;
    }

    try {
      // Get local data
      const [gameStatsStr, achievementsStr, profileStr, lastSync] = await Promise.all([
        AsyncStorage.getItem('game_stats'),
        AsyncStorage.getItem('achievements'),
        AsyncStorage.getItem('user_profile'),
        AsyncStorage.getItem(SYNC_KEY)
      ]);

      const syncData: Partial<SyncData> = {};
      
      if (gameStatsStr) syncData.gameStats = JSON.parse(gameStatsStr);
      if (achievementsStr) syncData.achievements = JSON.parse(achievementsStr);
      if (profileStr) syncData.userProfile = JSON.parse(profileStr);

      // Only sync if we have data
      if (!syncData.gameStats && !syncData.achievements && !syncData.userProfile) {
        return false;
      }

      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...syncData,
          lastSynced: lastSync ? new Date(lastSync) : null
        })
      });

      if (response.ok) {
        const serverData = await response.json();
        await this.mergeServerData(serverData);
        await AsyncStorage.setItem(SYNC_KEY, new Date().toISOString());
        console.log('Sync completed successfully');
        return true;
      } else {
        throw new Error(`Sync failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.queueForLaterSync(syncData as SyncData);
      return false;
    }
  }

  private async mergeServerData(serverData: any) {
    // Merge server data with local data, preferring the most recent updates
    if (serverData.gameStats) {
      const localStats = await AsyncStorage.getItem('game_stats');
      if (localStats) {
        const local = JSON.parse(localStats);
        const merged = this.mergeGameStats(local, serverData.gameStats);
        await AsyncStorage.setItem('game_stats', JSON.stringify(merged));
      } else {
        await AsyncStorage.setItem('game_stats', JSON.stringify(serverData.gameStats));
      }
    }

    if (serverData.achievements) {
      const localAchievements = await AsyncStorage.getItem('achievements');
      if (localAchievements) {
        const local = JSON.parse(localAchievements);
        const merged = this.mergeAchievements(local, serverData.achievements);
        await AsyncStorage.setItem('achievements', JSON.stringify(merged));
      } else {
        await AsyncStorage.setItem('achievements', JSON.stringify(serverData.achievements));
      }
    }

    if (serverData.userProfile) {
      await AsyncStorage.setItem('user_profile', JSON.stringify(serverData.userProfile));
    }
  }

  private mergeGameStats(local: GameStats, server: GameStats): GameStats {
    return {
      totalGames: Math.max(local.totalGames, server.totalGames),
      totalCorrect: Math.max(local.totalCorrect, server.totalCorrect),
      totalIncorrect: Math.max(local.totalIncorrect, server.totalIncorrect),
      currentStreak: Math.max(local.currentStreak, server.currentStreak),
      bestStreak: Math.max(local.bestStreak, server.bestStreak),
      coins: Math.max(local.coins, server.coins),
      level: Math.max(local.level, server.level),
      experience: Math.max(local.experience, server.experience),
      starsEarned: Math.max(local.starsEarned, server.starsEarned),
    };
  }

  private mergeAchievements(local: Achievement[], server: Achievement[]): Achievement[] {
    const merged = [...local];
    
    server.forEach(serverAchievement => {
      const localIndex = merged.findIndex(a => a.id === serverAchievement.id);
      if (localIndex >= 0) {
        // Keep the one that's unlocked or the most recent
        if (!merged[localIndex].unlocked && serverAchievement.unlocked) {
          merged[localIndex] = serverAchievement;
        }
      } else {
        merged.push(serverAchievement);
      }
    });

    return merged;
  }

  private queueForLaterSync(data: SyncData) {
    this.syncQueue.push(data);
    // Limit queue size to prevent memory issues
    if (this.syncQueue.length > 10) {
      this.syncQueue = this.syncQueue.slice(-5);
    }
  }

  private async processSyncQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const data = this.syncQueue.shift();
      if (data) {
        await this.syncData();
      }
    }
  }

  private async getAuthToken(): Promise<string> {
    // In a real implementation, you'd handle authentication
    // For now, return a placeholder
    const profile = await AsyncStorage.getItem('user_profile');
    if (profile) {
      const { id } = JSON.parse(profile);
      return `user_${id}`;
    }
    return 'anonymous';
  }

  isOnlineMode(): boolean {
    return this.isOnline;
  }

  getQueueLength(): number {
    return this.syncQueue.length;
  }
}

// Export singleton instance
export const cloudSync = CloudSyncService.getInstance();