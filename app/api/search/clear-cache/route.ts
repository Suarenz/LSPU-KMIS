import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { searchCacheService } from '@/lib/services/search-cache-service';

/**
 * Clear the search cache
 * Only accessible by admin users
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult;
    }
    
    const { user } = authResult;

    // Only allow admins to clear the cache
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can clear the search cache' },
        { status: 403 }
      );
    }

    // Clear the search cache
    await searchCacheService.clearCache();
    
    console.log(`🗑️ Search cache cleared by admin: ${user.email}`);

    return NextResponse.json({
      message: 'Search cache cleared successfully',
      clearedBy: user.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing search cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear search cache' },
      { status: 500 }
    );
  }
}
