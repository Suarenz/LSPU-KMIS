import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import analyticsService from '@/lib/services/analytics-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';

// GET /api/analytics
export async function GET(request: NextRequest) {
  // Check authentication - allow any authenticated user, not just ADMIN/FACULTY
  const authResult = await requireAuth(request);
  
  // Check if it's an error response
  if ('status' in authResult && authResult.status >= 400) {
    return authResult; // Return the error response
  }
  
  // Extract user from the successful auth result
  const { user } = authResult as { user: any };
  
  try {
    const analytics = await analyticsService.getAnalytics(user.id, user.role);
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}