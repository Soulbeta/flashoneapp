import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  timestamp: Date;
}

interface GamePerformance {
  averageResponseTime: number;
  flashAccuracy: number;
  deviceSpecs: {
    platform: string;
    memory: number;
    screen: { width: number; height: number };
  };
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: PerformanceMetrics[] = [];
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private rafId: number | null = null;

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  startTracking() {
    this.trackFPS();
    this.trackMemory();
  }

  stopTracking() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private trackFPS() {
    const measureFrame = () => {
      const currentTime = performance.now();
      this.frameCount++;

      if (currentTime >= this.lastFrameTime + 1000) {
        const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        
        if (fps < 50) {
          console.warn(`Low FPS detected: ${fps}`);
          this.logPerformanceIssue('LOW_FPS', { fps, timestamp: new Date() });
        }

        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }

      this.rafId = requestAnimationFrame(measureFrame);
    };

    measureFrame();
  }

  private trackMemory() {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        
        if (usedMB > 100) { // Alert if using more than 100MB
          console.warn(`High memory usage: ${usedMB}MB`);
          this.logPerformanceIssue('HIGH_MEMORY', { 
            used: usedMB, 
            total: totalMB, 
            timestamp: new Date() 
          });
        }
      }
    };

    setInterval(checkMemory, 30000); // Check every 30 seconds
  }

  async logPerformanceIssue(type: string, data: any) {
    try {
      const issues = await AsyncStorage.getItem('performance_issues') || '[]';
      const parsed = JSON.parse(issues);
      
      parsed.push({
        type,
        data,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Keep only last 50 issues
      if (parsed.length > 50) {
        parsed.splice(0, parsed.length - 50);
      }

      await AsyncStorage.setItem('performance_issues', JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to log performance issue:', error);
    }
  }

  recordGamePerformance(responseTime: number, accuracy: number) {
    const gamePerf: GamePerformance = {
      averageResponseTime: responseTime,
      flashAccuracy: accuracy,
      deviceSpecs: {
        platform: navigator.platform,
        memory: (navigator as any).deviceMemory || 0,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        }
      }
    };

    this.saveGamePerformance(gamePerf);
  }

  private async saveGamePerformance(perf: GamePerformance) {
    try {
      const existing = await AsyncStorage.getItem('game_performance') || '[]';
      const performances = JSON.parse(existing);
      
      performances.push({
        ...perf,
        timestamp: new Date().toISOString()
      });

      // Keep last 100 performance records
      if (performances.length > 100) {
        performances.splice(0, performances.length - 100);
      }

      await AsyncStorage.setItem('game_performance', JSON.stringify(performances));
    } catch (error) {
      console.error('Failed to save game performance:', error);
    }
  }

  async getPerformanceReport(): Promise<any> {
    try {
      const [issues, gamePerf] = await Promise.all([
        AsyncStorage.getItem('performance_issues'),
        AsyncStorage.getItem('game_performance')
      ]);

      return {
        issues: issues ? JSON.parse(issues) : [],
        gamePerformance: gamePerf ? JSON.parse(gamePerf) : [],
        deviceInfo: {
          userAgent: navigator.userAgent,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
            pixelRatio: window.devicePixelRatio
          },
          memory: (navigator as any).deviceMemory,
          connection: (navigator as any).connection?.effectiveType
        }
      };
    } catch (error) {
      console.error('Failed to get performance report:', error);
      return null;
    }
  }

  optimizeForLowEndDevice(): boolean {
    const memory = (navigator as any).deviceMemory;
    const screen = window.screen.width * window.screen.height;
    
    // Consider it low-end if memory < 4GB or screen resolution < 1M pixels
    return memory < 4 || screen < 1000000;
  }
}

export const performanceTracker = PerformanceTracker.getInstance();