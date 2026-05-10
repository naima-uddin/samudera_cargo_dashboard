// utils/performanceMonitor.js - Performance monitoring utilities
'use client';

/**
 * Log performance metrics to console and optionally send to analytics
 */
export const logPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  // Wait for page to be fully loaded
  if (document.readyState !== 'complete') {
    window.addEventListener('load', logMetrics);
  } else {
    logMetrics();
  }

  function logMetrics() {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;
    const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

    console.log('⚡ Performance Metrics:');
    console.log(`  📊 Total Page Load Time: ${pageLoadTime}ms`);
    console.log(`  🔗 Server Response Time: ${connectTime}ms`);
    console.log(`  🎨 DOM Rendering Time: ${renderTime}ms`);
    console.log(`  📄 DOM Content Loaded: ${domContentLoadedTime}ms`);

    // Log Core Web Vitals if available
    if ('web-vital' in window) {
      try {
        const lcp = performance.getEntriesByName('largest-contentful-paint')[0];
        const fid = performance.getEntriesByType('first-input')[0];
        const cls = performance.getEntriesByType('layout-shift');

        if (lcp) console.log(`  📈 LCP (Largest Contentful Paint): ${Math.round(lcp.startTime)}ms`);
        if (fid) console.log(`  ⌨️  FID (First Input Delay): ${Math.round(fid.processingStart - fid.startTime)}ms`);
        if (cls) {
          const clsValue = cls.reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value), 0);
          console.log(`  🔄 CLS (Cumulative Layout Shift): ${clsValue.toFixed(3)}`);
        }
      } catch (e) {
        console.log('  (Core Web Vitals not available)');
      }
    }
  }
};

/**
 * Measure API response time
 */
export const measureAPITime = (apiName, duration) => {
  console.log(`📡 API Call: ${apiName} - ${duration}ms`);
  
  // Flag slow API calls
  if (duration > 1000) {
    console.warn(`⚠️  Slow API: ${apiName} took ${duration}ms`);
  }
};

/**
 * Monitor long tasks
 */
export const monitorLongTasks = () => {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(`⏱️  Long Task detected: ${entry.duration.toFixed(0)}ms`);
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.log('Long task monitoring not available');
  }
};

/**
 * Get current Core Web Vitals
 */
export const getWebVitals = async () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const vitals = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null
    };

    // Collect metrics over time
    const collectMetrics = () => {
      // First Contentful Paint
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcp) vitals.fcp = Math.round(fcp.startTime);

      // Largest Contentful Paint
      const lcp = performance.getEntriesByName('largest-contentful-paint');
      if (lcp.length > 0) vitals.lcp = Math.round(lcp[lcp.length - 1].startTime);

      // First Input Delay
      const fid = performance.getEntriesByType('first-input')[0];
      if (fid) vitals.fid = Math.round(fid.processingStart - fid.startTime);

      // Cumulative Layout Shift
      const cls = performance.getEntriesByType('layout-shift');
      if (cls.length > 0) {
        vitals.cls = cls.reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value), 0);
      }

      // Time to First Byte
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) vitals.ttfb = Math.round(nav.responseStart - nav.fetchStart);

      resolve(vitals);
    };

    // Collect after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 0);
    } else {
      window.addEventListener('load', collectMetrics);
    }
  });
};

/**
 * Cache optimization monitor
 */
export const monitorCacheHits = () => {
  const cacheStats = {
    total: 0,
    hits: 0,
    misses: 0
  };

  return {
    recordHit() {
      cacheStats.total++;
      cacheStats.hits++;
      this.logStats();
    },
    recordMiss() {
      cacheStats.total++;
      cacheStats.misses++;
      this.logStats();
    },
    logStats() {
      const hitRate = ((cacheStats.hits / cacheStats.total) * 100).toFixed(1);
      console.log(`💾 Cache Stats: ${cacheStats.hits}/${cacheStats.total} hits (${hitRate}%)`);
    },
    getStats() {
      return cacheStats;
    }
  };
};

/**
 * Generate performance report
 */
export const generatePerformanceReport = async () => {
  const vitals = await getWebVitals();
  const report = {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : null,
    vitals,
    recommendations: []
  };

  // Add recommendations based on metrics
  if (vitals?.fcp && vitals.fcp > 3000) {
    report.recommendations.push('⚠️  First Contentful Paint > 3s - Consider optimizing server response time');
  }
  if (vitals?.lcp && vitals.lcp > 4000) {
    report.recommendations.push('⚠️  Largest Contentful Paint > 4s - Consider lazy loading or image optimization');
  }
  if (vitals?.cls && vitals.cls > 0.1) {
    report.recommendations.push('⚠️  Cumulative Layout Shift > 0.1 - Consider setting image dimensions');
  }

  console.log('📋 Performance Report:', report);
  return report;
};

/**
 * Track component render time
 */
export const useRenderTime = (componentName) => {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    if (renderTime > 100) {
      console.warn(`⚠️  Slow render: ${componentName} took ${renderTime.toFixed(0)}ms`);
    }
  };
};
