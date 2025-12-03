import { NextRequest, NextResponse } from 'next/server';
import { redisService } from '@/lib/services/redis-service';
import { searchCacheService } from '@/lib/services/search-cache-service';

export async function GET(request: NextRequest) {
  try {
    // Test basic Redis functionality
    const testKey = 'lspu_kmis_test';
    const testValue = { 
      message: 'Hello from LSPU KMIS Redis Integration', 
      timestamp: new Date().toISOString(),
      status: 'connected'
    };
    
    // Test set operation
    const setResult = await redisService.set(testKey, testValue, 300); // 5 minute TTL
    if (!setResult) {
      return NextResponse.json(
        { error: 'Failed to set value in Redis' }, 
        { status: 500 }
      );
    }
    
    // Test get operation
    const getResult = await redisService.get<any>(testKey);
    if (!getResult) {
      return NextResponse.json(
        { error: 'Failed to get value from Redis' }, 
        { status: 500 }
      );
    }
    
    // Clean up test key
    await redisService.del(testKey);
    
    // Test search cache functionality
    const mockResults = {
      results: [],
      total: 0,
      query: 'test query',
      processingTime: 0
    };
    
    await searchCacheService.setCachedResult('test query', mockResults, 'unit1', 'category1', {}, 300);
    const cachedResult = await searchCacheService.getCachedResult('test query', 'unit1', 'category1', {});
    
    if (cachedResult) {
      await searchCacheService.removeCachedResult('test query', 'unit1', 'category1', {});
    }
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection and operations are working correctly',
      testValue: getResult,
      searchCacheTest: !!cachedResult
    });
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json(
      { error: 'Redis connection test failed', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}