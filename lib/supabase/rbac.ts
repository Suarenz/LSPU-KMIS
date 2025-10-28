import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

// Define role types for type safety
export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL';

interface UserWithRole {
  user: User | null;
  role: UserRole | null;
}

/**
 * Get the authenticated user and their role from the database
 * This function should be used in server-side code (Server Components, API routes, etc.)
 */
export async function getUserWithRole(): Promise<UserWithRole> {
  const supabase = await createClient();
  
  const { 
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { user: null, role: null };
  }

  // Fetch user details from the database to get the role
  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('role')
    .eq('supabase_auth_id', user.id)
    .single();

  if (dbError) {
    console.error('Error fetching user role:', dbError);
    return { user, role: null };
  }

  return { 
    user, 
    role: userData?.role as UserRole || null 
  };
}

/**
 * Check if the authenticated user has the required role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const { role } = await getUserWithRole();
  return role === requiredRole;
}

/**
 * Check if the authenticated user has at least the required role level
 * This function assumes a hierarchy where admin > faculty > student > external
 */
export async function hasRoleLevel(requiredRole: UserRole): Promise<boolean> {
  const { role } = await getUserWithRole();
  
  if (!role) return false;
  
  // Define role hierarchy (ADMIN > FACULTY > STUDENT > EXTERNAL)
  const roleHierarchy: Record<UserRole, number> = {
    'EXTERNAL': 1,
    'STUDENT': 2,
    'FACULTY': 3,
    'ADMIN': 4
  };
  
  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}

/**
 * Check if the authenticated user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('ADMIN');
}

/**
 * Check if the authenticated user has admin or faculty role
 */
export async function isAdminOrFaculty(): Promise<boolean> {
  const { role } = await getUserWithRole();
  return role === 'ADMIN' || role === 'FACULTY';
}