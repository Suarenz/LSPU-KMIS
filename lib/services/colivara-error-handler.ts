import { NextResponse } from 'next/server';
import ColivaraService from './colivara-service';
import { Document } from '@/lib/api/types';

export enum ColivaraErrorType {
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class ColivaraError extends Error {
  constructor(
    public type: ColivaraErrorType,
    message: string,
    public originalError?: any,
    public status?: number
  ) {
    super(message);
    this.name = 'ColivaraError';
  }
}

export interface ErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackToTraditional?: boolean;
  timeout?: number;
}

export interface ProcessingResult {
  success: boolean;
  error?: ColivaraError;
  fallbackUsed?: boolean;
  data?: any;
}

export class ColivaraErrorHandler {
  private static instance: ColivaraErrorHandler;
  private circuitBreakerOpen = false;
  private lastFailureTime: Date | null = null;
  private failureCount = 0;
  private maxFailures = 5;
  private resetTimeout = 300000; // 5 minutes
  
  private constructor() {}

  public static getInstance(): ColivaraErrorHandler {
    if (!ColivaraErrorHandler.instance) {
      ColivaraErrorHandler.instance = new ColivaraErrorHandler();
    }
    return ColivaraErrorHandler.instance;
  }

  async handleColivaraOperation<T>(
    operation: () => Promise<T>,
    options: ErrorHandlingOptions = {}
  ): Promise<{ result: T | null; error?: ColivaraError; fallbackUsed: boolean }> {
    const { 
      maxRetries = 3, 
      retryDelay = 1000, 
      fallbackToTraditional = true,
      timeout = 30000 
    } = options;

    // Check circuit breaker status
    if (this.isCircuitBreakerOpen()) {
      if (fallbackToTraditional) {
        console.warn('Circuit breaker is open, using fallback to traditional processing');
        return { result: null, error: new ColivaraError(ColivaraErrorType.API_UNAVAILABLE, 'Service temporarily unavailable'), fallbackUsed: true };
      } else {
        throw new ColivaraError(ColivaraErrorType.API_UNAVAILABLE, 'Service temporarily unavailable due to circuit breaker');
      }
    }

    let lastError: ColivaraError | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to the operation
        const result = await this.withTimeout(operation(), timeout);
        this.resetCircuitBreaker(); // Reset on success
        return { result, error: undefined, fallbackUsed: false };
      } catch (error) {
        lastError = this.convertErrorToColivaraError(error);

        // Log the error
        console.error(`Colivara operation failed on attempt ${attempt + 1}:`, lastError);

        // Check if this is a permanent error that shouldn't be retried
        if (lastError && this.isPermanentError(lastError)) {
          break;
        }

        // Update circuit breaker on failure
        this.updateCircuitBreaker();

        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    // If we've exhausted retries and fallback is enabled
    if (fallbackToTraditional) {
      console.warn('Using fallback after Colivara operation failed:', lastError?.message);
      return { result: null, error: lastError, fallbackUsed: true };
    }

    // If fallback is not enabled, throw the last error
    throw lastError;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new ColivaraError(ColivaraErrorType.TIMEOUT, `Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  public convertErrorToColivaraError(error: any): ColivaraError {
    if (error instanceof ColivaraError) {
      return error;
    }

    // Check for specific error types
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new ColivaraError(ColivaraErrorType.NETWORK_ERROR, 'Network connection failed', error);
    }

    if (error.status === 429) {
      return new ColivaraError(ColivaraErrorType.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', error, error.status);
    }

    if (error.status === 401 || error.status === 403) {
      return new ColivaraError(ColivaraErrorType.AUTHENTICATION_FAILED, 'Authentication failed', error, error.status);
    }

    if (error.status >= 500) {
      return new ColivaraError(ColivaraErrorType.API_UNAVAILABLE, 'API temporarily unavailable', error, error.status);
    }

    if (error.name === 'TimeoutError') {
      return new ColivaraError(ColivaraErrorType.TIMEOUT, error.message, error);
    }

    // Default to processing failed
    return new ColivaraError(ColivaraErrorType.PROCESSING_FAILED, error.message || 'Processing failed', error);
  }

  private isPermanentError(error: ColivaraError): boolean {
    // These errors should not be retried
    return [
      ColivaraErrorType.AUTHENTICATION_FAILED,
      ColivaraErrorType.INVALID_RESPONSE
    ].includes(error.type);
  }

  private isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreakerOpen) {
      return false;
    }

    // Check if enough time has passed to close the circuit
    if (this.lastFailureTime && 
        new Date().getTime() - this.lastFailureTime.getTime() > this.resetTimeout) {
      this.circuitBreakerOpen = false;
      this.failureCount = 0;
      return false;
    }

    return true;
  }

  private updateCircuitBreaker(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.maxFailures) {
      this.circuitBreakerOpen = true;
      console.warn('Circuit breaker opened due to too many failures');
    }
  }

  private resetCircuitBreaker(): void {
    this.circuitBreakerOpen = false;
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to check service health
  async checkServiceHealth(service: ColivaraService): Promise<boolean> {
    try {
      return await service.validateApiKey();
    } catch (error) {
      console.error('Colivara service health check failed:', error);
      return false;
    }
  }

  // Method to handle graceful degradation
  async handleGracefulDegradation<T>(
    colivaraOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    options: ErrorHandlingOptions = {}
  ): Promise<{ result: T; degraded: boolean; error?: ColivaraError }> {
    const { result, error, fallbackUsed } = await this.handleColivaraOperation(
      colivaraOperation,
      { ...options, fallbackToTraditional: true }
    );

    if (fallbackUsed && result === null) {
      // Use fallback operation
      try {
        const fallbackResult = await fallbackOperation();
        return { result: fallbackResult, degraded: true, error };
      } catch (fallbackError) {
        console.error('Fallback operation also failed:', fallbackError);
        throw new ColivaraError(
          ColivaraErrorType.PROCESSING_FAILED, 
          'Both primary and fallback operations failed',
          fallbackError
        );
      }
    }

    if (result !== null) {
      return { result, degraded: false };
    }

    throw new ColivaraError(ColivaraErrorType.PROCESSING_FAILED, 'Operation failed', error);
  }
}

// Export a singleton instance
export const colivaraErrorHandler = ColivaraErrorHandler.getInstance();