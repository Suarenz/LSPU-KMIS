import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication using the existing middleware
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    
    // Get the Supabase client
    const supabase = await createClient();
    
    // First, get the session to ensure we have valid authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No active user session' },
        { status: 401 }
      );
    }

    // Check if the session is expired and refresh if necessary
    if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        // If refresh fails, the user is not authenticated
        return NextResponse.json(
          { error: 'Session expired and could not be refreshed' },
          { status: 401 }
        );
      }
    }

    // Get user's Supabase auth details
    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !supabaseUser) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, role, unitId')
      .eq('supabase_auth_id', supabaseUser.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // If profile doesn't exist in database, create a minimal user object from auth data
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.userId,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          role: supabaseUser.user_metadata?.role || 'STUDENT',
          unitId: undefined,
        }
      });
    }

    // Get user permissions for different resources
    // This is a simplified approach - in a real system, you'd have more complex permission logic
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('document_permissions')
      .select('documentId, permission')
      .eq('userId', profileData.id);

    let permissions: Record<string, any> = {};
    if (!permissionsError && permissionsData) {
      // Aggregate permissions by document or resource type
      permissions = permissionsData.reduce((acc: Record<string, any>, perm: any) => {
        acc[perm.documentId] = perm.permission;
        return acc;
      }, {});
    }

    // Get user's recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('document_views')
      .select('documentId, viewedAt')
      .eq('userId', profileData.id)
      .order('viewedAt', { ascending: false })
      .limit(5);

    // Return comprehensive user information
    return NextResponse.json({
      authenticated: true,
      user: {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role,
        unitId: profileData.unitId,
      },
      permissions,
      recentActivity: recentActivity || [],
      session: {
        expires_at: supabaseUser.app_metadata?.exp 
          ? new Date(supabaseUser.app_metadata.exp * 1000) 
          : null,
      }
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to update user preferences or settings
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    const supabase = await createClient();
    
    const { preferences } = await request.json();
    
    // Update user preferences in the database
    const { error } = await supabase
      .from('users')
      .update({ preferences })
      .eq('id', user.userId);
    
    if (error) {
      console.error('Error updating user preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update user preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'User preferences updated successfully' 
    });
  } catch (error) {
    console.error('Error in /api/auth/me POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
 }
}