import { Document } from '@/lib/api/types';

// Define types for monitoring events
export enum ColivaraEventType {
  API_CALL = 'api_call',
  DOCUMENT_PROCESSED = 'document_processed',
  DOCUMENT_PROCESSING_FAILED = 'document_processing_failed',
  SEARCH_PERFORMED = 'search_performed',
  ERROR_OCCURRED = 'error_occurred',
  HEALTH_CHECK = 'health_check',
  RATE_LIMIT_HIT = 'rate_limit_hit',
}

export interface ColivaraEvent {
  id: string;
  type: ColivaraEventType;
  timestamp: Date;
  userId?: string;
  documentId?: string;
  operation?: string; // Specific operation that was performed
  duration?: number; // Duration in milliseconds
  status?: 'success' | 'failure' | 'partial';
  error?: string;
  metadata?: Record<string, any>; // Additional metadata for the event
}

export interface ProcessingMetrics {
  totalProcessed: number;
  totalFailed: number;
  successRate: number;
  averageProcessingTime: number;
  processingTimes: number[];
}

export interface SearchMetrics {
  totalQueries: number;
  averageResponseTime: number;
  queriesPerMinute: number;
  successRate: number;
}

export interface ApiMetrics {
  totalCalls: number;
  successRate: number;
  averageResponseTime: number;
  rateLimitHits: number;
  errors: number;
}

export interface ColivaraHealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  apiLatency: number;
  errorRate: number;
  processingQueueLength: number;
  lastError?: string;
}

export class ColivaraMonitoringService {
  private static instance: ColivaraMonitoringService;
  private events: ColivaraEvent[] = [];
  private maxEventsStored = 1000; // Keep only the last 1000 events
  private processingMetrics: ProcessingMetrics;
  private searchMetrics: SearchMetrics;
  private apiMetrics: ApiMetrics;
  private healthStatus: ColivaraHealthStatus;
  private lastProcessingTimes: number[] = [];
  private readonly maxProcessingTimes = 100; // Keep last 100 processing times for averaging
  private lastApiCallTimes: number[] = [];
  private readonly maxApiCallTimes = 100; // Keep last 100 API call times for averaging
  private errorCounts: Map<string, number> = new Map(); // Track specific error counts

  private constructor() {
    this.processingMetrics = {
      totalProcessed: 0,
      totalFailed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      processingTimes: [],
    };

    this.searchMetrics = {
      totalQueries: 0,
      averageResponseTime: 0,
      queriesPerMinute: 0,
      successRate: 0,
    };

    this.apiMetrics = {
      totalCalls: 0,
      successRate: 0,
      averageResponseTime: 0,
      rateLimitHits: 0,
      errors: 0,
    };

    this.healthStatus = {
      isHealthy: true,
      lastCheck: new Date(),
      apiLatency: 0,
      errorRate: 0,
      processingQueueLength: 0,
    };
  }

  public static getInstance(): ColivaraMonitoringService {
    if (!ColivaraMonitoringService.instance) {
      ColivaraMonitoringService.instance = new ColivaraMonitoringService();
    }
    return ColivaraMonitoringService.instance;
  }

  /**
   * Log an event to the monitoring system
   */
  logEvent(event: Omit<ColivaraEvent, 'id' | 'timestamp'>): void {
    const newEvent: ColivaraEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event,
    };

    // Add to events list
    this.events.push(newEvent);

    // Trim events list if it exceeds max size
    if (this.events.length > this.maxEventsStored) {
      this.events = this.events.slice(-this.maxEventsStored);
    }

    // Update metrics based on event type
    this.updateMetrics(newEvent);
  }

  /**
   * Log a successful document processing event
   */
  logDocumentProcessed(documentId: string, userId?: string, duration?: number): void {
    this.logEvent({
      type: ColivaraEventType.DOCUMENT_PROCESSED,
      documentId,
      userId,
      duration,
      status: 'success',
      operation: 'document_processing',
    });
  }

  /**
   * Log a failed document processing event
   */
  logDocumentProcessingFailed(documentId: string, userId?: string, error?: string): void {
    this.logEvent({
      type: ColivaraEventType.DOCUMENT_PROCESSING_FAILED,
      documentId,
      userId,
      error,
      status: 'failure',
      operation: 'document_processing',
    });
  }

  /**
   * Log a search event
   */
  logSearchPerformed(userId?: string, duration?: number, status: 'success' | 'failure' = 'success', error?: string): void {
    this.logEvent({
      type: ColivaraEventType.SEARCH_PERFORMED,
      userId,
      duration,
      status,
      error,
      operation: 'semantic_search',
    });
  }

  /**
   * Log an API call event
   */
  logApiCall(operation: string, duration?: number, status: 'success' | 'failure' = 'success', error?: string): void {
    this.logEvent({
      type: ColivaraEventType.API_CALL,
      operation,
      duration,
      status,
      error,
    });
  }

  /**
   * Log an error event
   */
  logError(error: Error | string, operation?: string, documentId?: string, userId?: string): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    this.logEvent({
      type: ColivaraEventType.ERROR_OCCURRED,
      error: errorMessage,
      operation,
      documentId,
      userId,
      status: 'failure',
    });
  }

  /**
   * Log a rate limit hit
   */
  logRateLimitHit(operation: string): void {
    this.logEvent({
      type: ColivaraEventType.RATE_LIMIT_HIT,
      operation,
      status: 'failure',
      error: 'Rate limit exceeded',
    });
  }

  /**
   * Update metrics based on the event
   */
  private updateMetrics(event: ColivaraEvent): void {
    switch (event.type) {
      case ColivaraEventType.DOCUMENT_PROCESSED:
        if (event.duration !== undefined) {
          this.lastProcessingTimes.push(event.duration);
          if (this.lastProcessingTimes.length > this.maxProcessingTimes) {
            this.lastProcessingTimes = this.lastProcessingTimes.slice(-this.maxProcessingTimes);
          }
        }
        this.processingMetrics.totalProcessed++;
        break;

      case ColivaraEventType.DOCUMENT_PROCESSING_FAILED:
        this.processingMetrics.totalFailed++;
        break;

      case ColivaraEventType.SEARCH_PERFORMED:
        this.searchMetrics.totalQueries++;
        if (event.duration !== undefined) {
          // Update search metrics (simplified calculation)
          this.searchMetrics.averageResponseTime = 
            (this.searchMetrics.averageResponseTime * (this.searchMetrics.totalQueries - 1) + event.duration) / 
            this.searchMetrics.totalQueries;
        }
        break;

      case ColivaraEventType.API_CALL:
        this.apiMetrics.totalCalls++;
        if (event.duration !== undefined) {
          this.lastApiCallTimes.push(event.duration);
          if (this.lastApiCallTimes.length > this.maxApiCallTimes) {
            this.lastApiCallTimes = this.lastApiCallTimes.slice(-this.maxApiCallTimes);
          }
        }
        if (event.status === 'failure') {
          this.apiMetrics.errors++;
        }
        break;

      case ColivaraEventType.RATE_LIMIT_HIT:
        this.apiMetrics.rateLimitHits++;
        break;

      case ColivaraEventType.ERROR_OCCURRED:
        // Track specific error counts
        const errorKey = event.error || 'unknown_error';
        const count = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, count + 1);
        break;
    }

    // Update calculated metrics
    this.updateCalculatedMetrics();
  }

  /**
   * Update calculated metrics like success rates and averages
   */
  private updateCalculatedMetrics(): void {
    // Update processing success rate
    const totalProcessing = this.processingMetrics.totalProcessed + this.processingMetrics.totalFailed;
    if (totalProcessing > 0) {
      this.processingMetrics.successRate = (this.processingMetrics.totalProcessed / totalProcessing) * 100;
    }

    // Update API success rate
    if (this.apiMetrics.totalCalls > 0) {
      this.apiMetrics.successRate = ((this.apiMetrics.totalCalls - this.apiMetrics.errors) / this.apiMetrics.totalCalls) * 100;
    }

    // Update average processing time
    if (this.lastProcessingTimes.length > 0) {
      const sum = this.lastProcessingTimes.reduce((acc, val) => acc + val, 0);
      this.processingMetrics.averageProcessingTime = sum / this.lastProcessingTimes.length;
    }

    // Update API average response time
    if (this.lastApiCallTimes.length > 0) {
      const sum = this.lastApiCallTimes.reduce((acc, val) => acc + val, 0);
      this.apiMetrics.averageResponseTime = sum / this.lastApiCallTimes.length;
    }

    // Update search success rate
    // This is simplified - in a real implementation you'd track search failures separately
    this.searchMetrics.successRate = 100; // Placeholder
  }

  /**
   * Get processing metrics
   */
  getProcessingMetrics(): ProcessingMetrics {
    return { ...this.processingMetrics };
  }

  /**
   * Get search metrics
   */
  getSearchMetrics(): SearchMetrics {
    return { ...this.searchMetrics };
  }

  /**
   * Get API metrics
   */
  getApiMetrics(): ApiMetrics {
    return { ...this.apiMetrics };
  }

  /**
   * Get health status
   */
  getHealthStatus(): ColivaraHealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Perform a health check
   */
  async performHealthCheck(): Promise<ColivaraHealthStatus> {
    const startTime = Date.now();
    try {
      // In a real implementation, this would call the Colivara health endpoint
      // For now, we'll simulate a health check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const latency = Date.now() - startTime;
      const errorRate = this.calculateErrorRate();
      
      this.healthStatus = {
        isHealthy: errorRate < 0.1, // Healthy if error rate is less than 10%
        lastCheck: new Date(),
        apiLatency: latency,
        errorRate,
        processingQueueLength: 0, // Would come from actual queue system
      };
      
      this.logEvent({
        type: ColivaraEventType.HEALTH_CHECK,
        status: this.healthStatus.isHealthy ? 'success' : 'failure',
        metadata: {
          latency: this.healthStatus.apiLatency,
          errorRate: this.healthStatus.errorRate,
          queueLength: this.healthStatus.processingQueueLength,
        }
      });
      
      return { ...this.healthStatus };
    } catch (error: unknown) {
      this.healthStatus = {
        isHealthy: false,
        lastCheck: new Date(),
        apiLatency: Date.now() - startTime,
        errorRate: 1, // 100% error rate
        processingQueueLength: 0,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      };
      
      this.logError(error as Error | string, 'health_check');
      return { ...this.healthStatus };
    }
  }

  /**
   * Calculate the current error rate
   */
  private calculateErrorRate(): number {
    const totalEvents = this.events.length;
    if (totalEvents === 0) return 0;
    
    const errorEvents = this.events.filter(event => 
      event.status === 'failure' && 
      event.type !== ColivaraEventType.RATE_LIMIT_HIT // Don't count rate limit hits as general errors
    ).length;
    
    return errorEvents / totalEvents;
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 50): ColivaraEvent[] {
    return [...this.events].slice(-count).reverse();
  }

  /**
   * Get events by type
   */
  getEventsByType(type: ColivaraEventType, count: number = 50): ColivaraEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-count)
      .reverse();
  }

  /**
   * Get error events
   */
  getErrorEvents(count: number = 50): ColivaraEvent[] {
    return this.events
      .filter(event => event.status === 'failure')
      .slice(-count)
      .reverse();
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    return `colivara_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset all metrics (for testing purposes)
   */
  resetMetrics(): void {
    this.processingMetrics = {
      totalProcessed: 0,
      totalFailed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      processingTimes: [],
    };

    this.searchMetrics = {
      totalQueries: 0,
      averageResponseTime: 0,
      queriesPerMinute: 0,
      successRate: 0,
    };

    this.apiMetrics = {
      totalCalls: 0,
      successRate: 0,
      averageResponseTime: 0,
      rateLimitHits: 0,
      errors: 0,
    };

    this.lastProcessingTimes = [];
    this.lastApiCallTimes = [];
    this.errorCounts.clear();
  }

  /**
   * Get error summary
   */
  getErrorSummary(): { errorType: string; count: number }[] {
    return Array.from(this.errorCounts.entries())
      .map(([errorType, count]) => ({ errorType, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// Export a singleton instance
export const colivaraMonitoringService = ColivaraMonitoringService.getInstance();