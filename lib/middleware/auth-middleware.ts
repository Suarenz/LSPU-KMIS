import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function requireAuth(request: NextRequest, roles?: string[]): Promise<{ user: any } | NextResponse> {
  const supabase = await createClient();
  
  // Get the user from Supabase (authenticates the data by contacting the Supabase Auth server)
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Supabase user error:', error);
    return NextResponse.json(
      { error: `User error: ${error.message}` },
      { status: 401 }
    );
  }
  
 if (!user) {
    return NextResponse.json(
      { error: 'No active user session' },
      { status: 401 }
    );
  }
  
 // Get user profile from database to include role and other details
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('id, email, name, role, department')
    .eq('supabase_auth_id', user.id)
    .single();
  
  if (profileError) {
    // Check if it's a "not found" error specifically or an empty error object
    if (profileError.code === 'PGRST116' || profileError.message?.includes('not found') || (Object.keys(profileError).length === 0 && profileError.constructor === Object)) {
      console.log('User profile not found in database for user:', user.id);
    } else {
      // Log the error for other types of errors
      console.error('Profile fetch error:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError,
        userId: user.id,
        userEmail: user.email
      });
    }
    // If profile doesn't exist, create a minimal user object from auth data
    const userData = {
      userId: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'STUDENT',
    };
    
    // Check if user has required role if roles are specified
    if (roles && !roles.includes(userData.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return { user: userData };
  }
  
  if (!profileData) {
    // Profile doesn't exist in database
    const userData = {
      userId: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'STUDENT',
    };
    
    // Check if user has required role if roles are specified
    if (roles && !roles.includes(userData.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return { user: userData };
  }
  
  // Check if user has required role if roles are specified
 if (roles && !roles.includes(profileData.role)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Return user data with consistent structure
  const userData = {
    userId: profileData.id,
    email: profileData.email,
    role: profileData.role,
  };
  
  return { user: userData };
}