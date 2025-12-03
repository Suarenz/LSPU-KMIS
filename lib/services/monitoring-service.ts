interface PerformanceMetrics {
  timestamp: Date;
  endpoint: string;
 responseTime: number; // in milliseconds
  userId?: string;
  query?: string;
  success: boolean;
  error?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}

interface MonitoringConfig {
  logPerformance: boolean;
  logErrors: boolean;
  logUsage: boolean;
  performanceThreshold: number; // in milliseconds
}

class MonitoringService {
  private static instance: MonitoringService;
  private config: MonitoringConfig;
  private metrics: PerformanceMetrics[] = [];
 private readonly maxMetricsStored: number = 1000; // Keep last 1000 metrics

  private constructor() {
    this.config = {
      logPerformance: process.env.LOG_PERFORMANCE === 'true' || true,
      logErrors: process.env.LOG_ERRORS === 'true' || true,
      logUsage: process.env.LOG_USAGE === 'true' || true,
      performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD_MS || '5000', 10), // 5 seconds default
    };
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Log a performance metric
   */
  public logMetric(metric: Omit<PerformanceMetrics, 'timestamp'>): void {
    if (!this.config.logPerformance && !this.config.logUsage) {
      return; // Skip logging if not enabled
    }

    const fullMetric: PerformanceMetrics = {
      ...metric,
      timestamp: new Date(),
    };

    // Add to metrics array
    this.metrics.push(fullMetric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics = this.metrics.slice(-this.maxMetricsStored);
    }

    // Log to console based on configuration
    if (metric.success) {
      if (this.config.logPerformance) {
        console.log(`[PERFORMANCE] ${metric.endpoint} took ${metric.responseTime}ms for user ${metric.userId || 'unknown'}`);
      }
    } else {
      if (this.config.logErrors) {
        console.error(`[ERROR] ${metric.endpoint} failed for user ${metric.userId || 'unknown'}: ${metric.error}`);
      }
    }

    // Alert if response time exceeds threshold
    if (metric.responseTime > this.config.performanceThreshold) {
      console.warn(`[PERFORMANCE ALERT] ${metric.endpoint} exceeded threshold: ${metric.responseTime}ms > ${this.config.performanceThreshold}ms`);
    }
  }

 /**
   * Track API usage
   */
  public trackUsage(userId: string, endpoint: string, model?: string): void {
    if (!this.config.logUsage) {
      return;
    }

    console.log(`[USAGE] User ${userId} accessed ${endpoint}${model ? ` using model ${model}` : ''} at ${new Date().toISOString()}`);
  }

  /**
   * Track generation performance
   */
 public trackGeneration(userId: string, query: string, responseTime: number, success: boolean, error?: string, model?: string): void {
    this.logMetric({
      endpoint: 'ai-generation',
      responseTime,
      userId,
      query,
      success,
      error,
      model
    });
  }

 /**
   * Track search performance
   */
  public trackSearch(userId: string, query: string, responseTime: number, success: boolean, error?: string): void {
    this.logMetric({
      endpoint: 'search',
      responseTime,
      userId,
      query,
      success,
      error
    });
  }

  /**
   * Get performance summary for an endpoint
   */
  public getPerformanceSummary(endpoint: string): {
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    errorRate: number;
  } {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint);
    
    if (endpointMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        errorRate: 0
      };
    }

    const responseTimes = endpointMetrics.map(m => m.responseTime);
    const successful = endpointMetrics.filter(m => m.success).length;
    const failed = endpointMetrics.filter(m => !m.success).length;
    
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    const totalRequests = endpointMetrics.length;
    const errorRate = failed / totalRequests;

    return {
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      totalRequests,
      successfulRequests: successful,
      failedRequests: failed,
      errorRate
    };
  }

  /**
   * Get all metrics (for debugging/monitoring purposes)
   */
  public getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics]; // Return a copy to prevent external modification
 }

  /**
   * Clear all stored metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get current configuration
   */
  public getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default MonitoringService;