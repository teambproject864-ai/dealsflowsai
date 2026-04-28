import { checkVectorHealth } from './vector-sync';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: string;
  success: boolean;
  metadata?: any;
}

const metrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * Logs a performance metric for a vector operation.
 */
export function logVectorMetric(metric: Omit<PerformanceMetrics, 'timestamp'>) {
  const fullMetric = {
    ...metric,
    timestamp: new Date().toISOString()
  };
  
  metrics.push(fullMetric);
  
  // Keep metrics list at reasonable size
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }
  
  // Also log to console for visibility
  console.log(`[VectorMonitor] ${metric.operation}: ${metric.duration}ms (${metric.success ? 'SUCCESS' : 'FAILED'})`);
}

/**
 * Gets aggregated performance statistics.
 */
export function getVectorStats() {
  const stats: Record<string, any> = {};
  
  const ops = [...new Set(metrics.map(m => m.operation))];
  
  ops.forEach(op => {
    const opMetrics = metrics.filter(m => m.operation === op);
    const durations = opMetrics.map(m => m.duration);
    
    stats[op] = {
      count: opMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      successRate: opMetrics.filter(m => m.success).length / opMetrics.length
    };
  });
  
  return stats;
}

/**
 * Returns a comprehensive health and performance report.
 */
export async function getVectorSystemReport() {
  const health = await checkVectorHealth();
  const stats = getVectorStats();
  
  return {
    health,
    performance: stats,
    lastUpdated: new Date().toISOString()
  };
}
