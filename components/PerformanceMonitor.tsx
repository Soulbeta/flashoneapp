import React, { useEffect } from 'react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

export function PerformanceMonitor({ children }: PerformanceMonitorProps) {
  useEffect(() => {
    // Monitor memory usage and performance
    const monitorPerformance = () => {
      if (__DEV__) {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          console.log('Memory usage:', {
            used: Math.round(memoryInfo.usedJSHeapSize / 1048576) + 'MB',
            total: Math.round(memoryInfo.totalJSHeapSize / 1048576) + 'MB',
            limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576) + 'MB',
          });
        }
      }
    };

    const interval = setInterval(monitorPerformance, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Monitor frame drops
    const trackFPS = () => {
      let lastTime = performance.now();
      let frames = 0;

      const measure = () => {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frames * 1000) / (currentTime - lastTime));
          if (fps < 50 && __DEV__) {
            console.warn('Low FPS detected:', fps);
          }
          frames = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(measure);
      };

      if (__DEV__) {
        measure();
      }
    };

    trackFPS();
  }, []);

  return <>{children}</>;
}