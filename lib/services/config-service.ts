import { GoogleGenerativeAI } from '@google/generative-ai';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

interface SecurityConfig {
  rateLimit: RateLimitConfig;
  apiKeyRotationInterval: number; // in hours
  requestTimeout: number; // in milliseconds
}

class ConfigService {
  private static instance: ConfigService;
  private config: SecurityConfig;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  
  private constructor() {
    this.config = {
      rateLimit: {
        maxRequests: parseInt(process.env.AI_MAX_REQUESTS_PER_HOUR || '60', 10), // Default 60 requests per hour
        windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
      },
      apiKeyRotationInterval: parseInt(process.env.API_KEY_ROTATION_INTERVAL_HOURS || '24', 10), // Default 24 hours
      requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000', 10), // Default 30 seconds
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Check if a request from a given user/identifier is allowed based on rate limiting
   */
  public isRequestAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.rateLimit.windowMs;
    
    const record = this.requestCounts.get(identifier);
    
    if (!record) {
      // First request from this identifier
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + this.config.rateLimit.windowMs
      });
      return true;
    }
    
    // Clean up old records
    if (record.resetTime < now) {
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + this.config.rateLimit.windowMs
      });
      return true;
    }
    
    // Check if limit is exceeded
    if (record.count >= this.config.rateLimit.maxRequests) {
      return false;
    }
    
    // Increment count
    this.requestCounts.set(identifier, {
      count: record.count + 1,
      resetTime: record.resetTime
    });
    
    return true;
  }

  /**
   * Get remaining requests for a given identifier
   */
  public getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || record.resetTime < now) {
      return this.config.rateLimit.maxRequests;
    }
    
    return Math.max(0, this.config.rateLimit.maxRequests - record.count);
  }

  /**
   * Get rate limit reset time for a given identifier
   */
  public getResetTime(identifier: string): number {
    const record = this.requestCounts.get(identifier);
    return record ? record.resetTime : Date.now() + this.config.rateLimit.windowMs;
  }

  /**
   * Get the current security configuration
   */
  public getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Validate API key format
   */
  public validateApiKey(apiKey: string): boolean {
    // Basic validation - check if API key has content
    return apiKey.trim().length > 0;
  }

  /**
   * Health check for the AI API
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const apiKey = process.env.AI_API_KEY;
      if (!apiKey) {
        console.error('AI_API_KEY is not set');
        return false;
      }

      // For now, we'll just check if the API key exists and has some content
      // A more comprehensive health check would require knowing which service is using this config
      if (!apiKey.trim()) {
        console.error('AI_API_KEY is empty');
        return false;
      }

      // This is a basic health check that just confirms the API key exists
      // More specific health checks should be implemented in the respective services
      return true;
    } catch (error: any) {
      console.error('AI API health check failed:', error);
      return false;
    }
  }
}

export default ConfigService;