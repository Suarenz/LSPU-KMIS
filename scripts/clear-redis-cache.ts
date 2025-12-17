/**
 * Redis Cache Clear Utility
 * Clears all QPro-related cache entries from Redis
 * 
 * Usage: npx ts-node scripts/clear-redis-cache.ts [pattern]
 * Examples:
 *   npx ts-node scripts/clear-redis-cache.ts qpro:extract:*    # Clear extraction cache
 *   npx ts-node scripts/clear-redis-cache.ts qpro:*            # Clear all QPro cache
 *   npx ts-node scripts/clear-redis-cache.ts *                 # Clear ALL cache (⚠️ careful!)
 */

import { Redis } from '@upstash/redis';

// Initialize Redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function clearCache(pattern: string = 'qpro:*'): Promise<void> {
  try {
    console.log(`🔍 Searching for keys matching pattern: "${pattern}"`);
    
    // Get all keys matching the pattern
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      console.log('✅ No keys found matching this pattern');
      return;
    }
    
    console.log(`📊 Found ${keys.length} key(s) to delete:`);
    keys.forEach((key) => console.log(`   - ${key}`));
    
    // Delete all matching keys
    for (const key of keys) {
      await redis.del(key);
      console.log(`🗑️  Deleted: ${key}`);
    }
    
    console.log(`\n✅ Successfully cleared ${keys.length} cache entries`);
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

// Get pattern from command line arguments or use default
const pattern = process.argv[2] || 'qpro:*';

console.log('🚀 Redis Cache Clear Utility\n');
clearCache(pattern).then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});
