/**
 * Script to clear the search cache
 * 
 * RECOMMENDED: Use the API endpoint instead:
 *   POST http://localhost:3000/api/search/clear-cache
 *   (requires admin authentication)
 * 
 * OR: Run this script with Next.js environment:
 *   npm run dev  (in another terminal)
 *   npx tsx scripts/clear-search-cache.ts
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📁 Loading .env from:', path.resolve(__dirname, '../.env'));
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
  console.log('\n💡 Alternative: Use the API endpoint');
  console.log('   POST /api/search/clear-cache (requires admin token)');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('📝 UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '✓ set' : '✗ missing');
console.log('📝 UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✓ set' : '✗ missing');

// Now import after env is loaded
import { searchCacheService } from '../lib/services/search-cache-service';

async function clearSearchCache() {
  console.log('🗑️ Clearing search cache...');
  
  try {
    await searchCacheService.clearCache();
    console.log('✅ Search cache cleared successfully!');
    console.log('📊 Cache metrics have been reset.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing search cache:', error);
    process.exit(1);
  }
}

// Run the script
clearSearchCache();
