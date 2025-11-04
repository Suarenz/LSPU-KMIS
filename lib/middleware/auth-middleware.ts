import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function requireAuth(request: NextRequest, roles?: string[]): Promise<{ user: any } | NextResponse> {
  const supabase = await createClient();
  
  // First, get the session to ensure we have valid authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Supabase session error:', sessionError || 'No session found');
    return NextResponse.json(
      { error: 'No active user session' },
      { status: 401 }
    );
  }

  // Check if the session is expired
  if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
    // Try to refresh the session
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshedSession) {
      // If refresh fails, the user is not authenticated
      console.error('Session refresh failed:', refreshError);
      return NextResponse.json(
        { error: 'No active user session' },
        { status: 401 }
      );
    }
  }

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
   .select('id, email, name, role, unitId')
   .eq('supabase_auth_id', user.id)
   .single();
  
  if (profileError) {
    // Check if it's a "not found" error specifically or an empty error object
    if (profileError.code === 'PGRST116' || profileError.message?.includes('not found') || (Object.keys(profileError).length === 0 && profileError.constructor === Object)) {
      console.log('User profile not found in database for user:', user.id);
      // User exists in Supabase Auth but not in our users table
      // Create a minimal profile for the user if it doesn't exist
      // Use the Supabase client for consistency with the rest of the auth flow
      const id = uuidv4(); // Generate a unique ID
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id,
          supabase_auth_id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: user.user_metadata?.role || 'STUDENT',
        }]);
      
      if (insertError) {
        console.error('Error creating user profile after missing profile detected:', insertError);
        // Still return a minimal user object even if profile creation fails
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
      } else {
        console.log('New user profile created successfully for user:', user.id);
        // Profile created successfully, fetch the database ID to return
        const { data: newProfileData, error: newProfileError } = await supabase
          .from('users')
          .select('id, email, name, role, unitId')
          .eq('supabase_auth_id', user.id)
          .single();
        
        if (newProfileError) {
          console.error('Error fetching new user profile after creation:', newProfileError);
          // Return user with Supabase auth ID if database profile fetch fails
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
        
        // Return user data with database ID
        const userData = {
          userId: newProfileData.id,
          email: newProfileData.email,
          role: newProfileData.role,
          unitId: newProfileData.unitId || undefined,
        };
        
        // Check if user has required role if roles are specified
        if (roles && !roles.includes(newProfileData.role)) {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }
        
        return { user: userData };
      }
    } else {
      // Log the error for other types of errors
      console.error('Profile fetch error:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError,
        userId: user.id,
        userEmail: user.email
      });
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
   unitId: profileData.unitId || undefined,
};
  
  return { user: userData };
}