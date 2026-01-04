import { Redis } from '@upstash/redis';

// Interface for Redis-like operations to support both Upstash and local Redis
interface RedisInterface {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown>;
  setex(key: string, ttl: number, value: unknown): Promise<unknown>;
  del(key: string): Promise<unknown>;
  exists(key: string): Promise<number>;
  expire(key: string, ttl: number): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
}

// Local Redis adapter using RESP protocol over HTTP is not available,
// so we create a simple in-memory fallback for Docker environments without Upstash
class InMemoryRedisAdapter implements RedisInterface {
  private store: Map<string, { value: unknown; expiry?: number }> = new Map();

  private isExpired(key: string): boolean {
    const item = this.store.get(key);
    if (!item) return true;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return true;
    }
    return false;
  }

  async get(key: string): Promise<unknown> {
    if (this.isExpired(key)) return null;
    return this.store.get(key)?.value ?? null;
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown> {
    const expiry = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async setex(key: string, ttl: number, value: unknown): Promise<unknown> {
    return this.set(key, value, { ex: ttl });
  }

  async del(key: string): Promise<unknown> {
    this.store.delete(key);
    return 1;
  }

  async exists(key: string): Promise<number> {
    return this.isExpired(key) ? 0 : 1;
  }

  async expire(key: string, ttl: number): Promise<unknown> {
    const item = this.store.get(key);
    if (item) {
      item.expiry = Date.now() + ttl * 1000;
      return 1;
    }
    return 0;
  }

  async keys(pattern: string): Promise<string[]> {
    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const result: string[] = [];
    for (const key of this.store.keys()) {
      if (!this.isExpired(key) && regex.test(key)) {
        result.push(key);
      }
    }
    return result;
  }
}

class RedisService {
  public redis: RedisInterface;
  private isUpstash: boolean;

  constructor() {
    // Check if Upstash credentials are available
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (upstashUrl && upstashToken && upstashUrl !== 'https://dummy.upstash.io') {
      // Use Upstash Redis (production/cloud)
      this.redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      this.isUpstash = true;
      console.log('[RedisService] Using Upstash Redis');
    } else {
      // Use in-memory fallback for Docker/local without Upstash
      this.redis = new InMemoryRedisAdapter();
      this.isUpstash = false;
      console.log('[RedisService] Using in-memory Redis fallback (no Upstash credentials)');
    }
  }
  
  /**
   * Check if using Upstash Redis or fallback
   */
  isUsingUpstash(): boolean {
    return this.isUpstash;
  }

  // Generic methods for common operations
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value as T | null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`Error setting expiration for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  }
}

export const redisService = new RedisService();
export default RedisService;