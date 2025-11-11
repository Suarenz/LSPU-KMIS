import { createClient } from '@/lib/supabase/client';
import { AuthResponse, User } from '@supabase/supabase-js';
import type { User as AppUser } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface LoginResult {
  success: boolean;
  user?: AppUser;
  error?: string;
}

// Cache configuration
const SESSION_CACHE_KEY = 'lspu_kmis_session_cache';
const LAST_CHECK_KEY = 'lspu_kmis_last_auth_check';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class SupabaseAuthService {
  supabase;
  private sessionValidationDebounce: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = createClient();
  }

  getSupabaseClient() {
    return this.supabase;
  }

  /**
   * Get cached session data if it exists and hasn't expired
   */
  getCachedSession(): any | null {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(SESSION_CACHE_KEY);
      if (cached) {
        try {
          const { data, expiration } = JSON.parse(cached);
          // Only use cache if not expired
          if (Date.now() < expiration) {
            return data;
          } else {
            // Clear expired cache
            localStorage.removeItem(SESSION_CACHE_KEY);
          }
        } catch (error) {
          console.error('Error parsing cached session:', error);
          localStorage.removeItem(SESSION_CACHE_KEY);
        }
      }
    }
    return null;
  }

  /**
   * Set cached session data with expiration
   */
  setCachedSession(sessionData: any, ttl: number = DEFAULT_CACHE_TTL) {
    if (typeof window !== 'undefined') {
      const expiration = Date.now() + ttl;
      try {
        localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
          data: sessionData,
          expiration
        }));
      } catch (error) {
        console.error('Error caching session:', error);
      }
    }
  }

  /**
   * Clear cached session
   */
  clearCachedSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_CACHE_KEY);
      localStorage.removeItem(LAST_CHECK_KEY);
    }
  }

  /**
   * Get the last auth check timestamp
   */
  getLastAuthCheck(): number | null {
    if (typeof window !== 'undefined') {
      const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
      return lastCheck ? parseInt(lastCheck) : null;
    }
    return null;
  }

  /**
   * Set the last auth check timestamp
   */
  setLastAuthCheck(timestamp: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_CHECK_KEY, timestamp.toString());
    }
  }

  /**
   * Validate session without triggering loading state
   */
  async validateSessionWithoutLoading(): Promise<boolean> {
    if (this.sessionValidationDebounce) {
      clearTimeout(this.sessionValidationDebounce);
    }
    
    return new Promise((resolve) => {
      this.sessionValidationDebounce = setTimeout(async () => {
        try {
          const { data: { session }, error } = await this.supabase.auth.getSession();
          if (error) {
            console.error('Session validation error:', error);
            resolve(false);
          } else {
            resolve(!!session);
          }
        } catch (error) {
          console.error('Session validation error:', error);
          resolve(false);
        }
      }, 500); // Only validate after 500ms of inactivity
    });
 }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Get user profile from database to include role and other details
        const { data: profileData, error: profileError } = await this.supabase
          .from('users')
          .select('id, email, name, role, unitId')
          .eq('supabase_auth_id', data.user.id)
          .single();

        if (profileError) {
          // Check if it's a "not found" error specifically or an empty error object
          if (profileError.code === 'PGRST116' || profileError.message?.includes('not found') || (Object.keys(profileError).length === 0 && profileError.constructor === Object)) {
            console.log('User profile not found in database, creating new profile for user:', data.user.id);
            // User exists in Supabase Auth but not in our users table
            // Create a minimal profile for the user if it doesn't exist
            const id = uuidv4(); // Generate a unique ID
            const { error: insertError } = await this.supabase
              .from('users')
              .insert([{
                id,
                supabase_auth_id: data.user.id,
                email: data.user.email || email,
                name: data.user.user_metadata?.name || email.split('@')[0] || email.split('@')[0],
                role: data.user.user_metadata?.role || 'STUDENT',
                updatedAt: new Date().toISOString(),
              }]);

            if (insertError) {
              console.error('Error creating user profile after login:', insertError);
              // Still return a minimal user object even if profile creation fails
              return {
                success: true,
                user: {
                  id: data.user.id,
                  email: data.user.email || email,
                  name: data.user.user_metadata?.name || email.split('@')[0],
                  role: data.user.user_metadata?.role || 'STUDENT',
                }
              };
            } else {
              console.log('New user profile created successfully during login for user:', data.user.id);
              // Profile created successfully, fetch the database ID
              const { data: newProfileData, error: newProfileError } = await this.supabase
                .from('users')
                .select('id, email, name, role, unitId')
                .eq('supabase_auth_id', data.user.id)
                .single();

              if (newProfileError) {
                console.error('Error fetching new user profile after creation:', newProfileError);
                // Return user with Supabase auth ID if database profile fetch fails
                return {
                  success: true,
                  user: {
                    id: data.user.id,
                    email: data.user.email || email,
                    name: data.user.user_metadata?.name || email.split('@')[0],
                    role: data.user.user_metadata?.role || 'STUDENT',
                  }
                };
              }

              // Return user data with database ID
              const user = {
                id: newProfileData.id,
                email: newProfileData.email,
                name: newProfileData.name,
                role: newProfileData.role,
                unitId: newProfileData.unitId || undefined,
              };

              return {
                success: true,
                user: user
              };
            }
          } else {
            // For other errors, return a minimal user object based on auth data
            console.error('Unexpected profile fetch error during login:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError,
              userId: data.user.id,
              userEmail: data.user.email
            });
            return {
              success: true,
              user: {
                id: data.user.id,
                email: data.user.email || email,
                name: data.user.user_metadata?.name || email.split('@')[0],
                role: data.user.user_metadata?.role || 'STUDENT',
              }
            };
          }
        }

        // Return user data immediately after successful login
        const user = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
        };

        return {
          success: true,
          user: user
        };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  }

  async signup(email: string, password: string, name: string, role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL' = 'STUDENT', department?: string): Promise<LoginResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          department,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Create user profile in our database
      const id = uuidv4(); // Generate a unique ID
      const { error: profileError } = await this.supabase
        .from('users')
        .insert([{
          id,
          supabase_auth_id: data.user.id,
          email: data.user.email,
          name: name,
          role: role as any, // Type assertion since role is properly typed at function level
          updatedAt: new Date().toISOString(),
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      // After successful profile creation, fetch the user's database ID to return it
      const { data: profileData, error: fetchError } = await this.supabase
        .from('users')
        .select('id, email, name, role, unitId')
        .eq('supabase_auth_id', data.user.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching user profile after signup:', fetchError);
        // Return user with Supabase auth ID if database profile fetch fails
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: name,
            role: role as any, // Type assertion since role is properly typed at function level,
            unitId: undefined,
          }
        };
      }

      return {
        success: true,
        user: {
          id: profileData.id, // Use the database user ID
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
          unitId: profileData.unitId || undefined,
        }
      };
    }

    return { success: false, error: 'Signup failed' };
  }

  async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
    }
 }

  async getCurrentUser(): Promise<AppUser | null> {
    try {
      // First try to get the session to ensure we have valid authentication
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      // If no session exists, return null immediately
      if (sessionError || !session) {
        return null;
      }

      // Check if the session is expired
      if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await this.supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          // If refresh fails, the user is not authenticated
          return null;
        }
      }

      // Use getUser() instead of getSession() to authenticate the data by contacting the Supabase Auth server
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }

      // Get user profile from database to include role and other details
      // Using Promise.allSettled to run operations in parallel where possible
      const profilePromise = this.supabase
        .from('users')
        .select('id, email, name, role, unitId')
        .eq('supabase_auth_id', user.id)
        .single();

      const [profileResult] = await Promise.allSettled([profilePromise]);

      if (profileResult.status === 'rejected' || profileResult.value.error) {
        const profileError = profileResult.status === 'rejected' ? profileResult.reason : profileResult.value.error;
        // Check if it's a "not found" error specifically or an empty error object
        if (profileError?.code === 'PGRST116' || profileError?.message?.includes('not found') || (Object.keys(profileError).length === 0 && profileError.constructor === Object)) {
          console.log('User profile not found in database, creating new profile for user:', user.id);
          // User exists in Supabase Auth but not in our users table
          // Create a minimal profile for the user if it doesn't exist
          const id = uuidv4(); // Generate a unique ID
          const { error: insertError } = await this.supabase
            .from('users')
            .insert([{
              id,
              supabase_auth_id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: user.user_metadata?.role || 'STUDENT',
              updatedAt: new Date().toISOString(),
            }]);

          if (insertError) {
            console.error('Error creating user profile after missing profile detected:', insertError);
            // Still return a minimal user object even if profile creation fails
            return {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email || 'User',
              role: user.user_metadata?.role || 'student',
              unitId: undefined,
            };
          } else {
            console.log('New user profile created successfully for user:', user.id);
            // Profile created successfully, return it
            return {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: user.user_metadata?.role || 'STUDENT',
              unitId: undefined,
            };
          }
        } else {
          // For other errors, return a minimal user object based on auth data
          console.error('Unexpected profile fetch error:', {
            code: profileError?.code,
            message: profileError?.message,
            details: profileError,
            userId: user.id,
            userEmail: user.email
          });
          return {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email || 'User',
            role: user.user_metadata?.role || 'STUDENT',
          };
        }
      }

      const profileData = profileResult.value.data;

      if (profileData) {
        return {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
        };
      }

      // If no profile data but no error, return minimal user object
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email || 'User',
        role: user.user_metadata?.role || 'STUDENT',
        unitId: undefined,
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async getUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  }

 async isAuthenticated(): Promise<boolean> {
    try {
      // First try to get the session to ensure we have valid authentication
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      // If no session exists, return false immediately
      if (sessionError || !session) {
        return false;
      }

      // Check if the session is expired
      if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await this.supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          // If refresh fails, the user is not authenticated
          return false;
        }
      }

      // Use getUser() instead of getSession() to authenticate the data by contacting the Supabase Auth server
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) {
        console.error('User check error:', error);
        return false;
      }
      return user !== null;
    } catch (error) {
      console.error('Error in isAuthenticated:', error);
      return false;
    }
  }

 async getAccessToken(): Promise<string | null> {
    try {
      // Try to get the session first
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError || !session) {
        return null;
      }
      
      if (session?.access_token) {
        return session.access_token;
      }
      
      // Check if the session is expired
      if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await this.supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          // If refresh fails, return null
          return null;
        }
        
        return refreshedSession.access_token || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

 /**
  * Fetch comprehensive user data in a single call to optimize performance
  * This method uses the new /api/auth/me endpoint to get all user information at once
  */
async getComprehensiveUserData(): Promise<any> {
   try {
     // Check if we have cached session data and it's still valid
     const cachedSession = this.getCachedSession();
     if (cachedSession) {
       return cachedSession;
     }
     
     const token = await this.getAccessToken();
     
     if (!token) {
       // If no token is available, check if user is authenticated before throwing error
       const isAuthenticated = await this.isAuthenticated();
       if (!isAuthenticated) {
         // User is not authenticated, return null to indicate this
         return { authenticated: false, user: null };
       } else {
         // User is authenticated but we can't get a token, try alternative approach
         // First try to get a session and refresh it if needed
         const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
         
         if (sessionError || !session) {
           return { authenticated: false, user: null };
         }
         
         // Check if the session is expired and refresh if necessary
         if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
           const { data: { session: refreshedSession }, error: refreshError } = await this.supabase.auth.refreshSession();
           
           if (refreshError || !refreshedSession) {
             // If refresh fails, return not authenticated
             return { authenticated: false, user: null };
           }
         }
         
         // Now try to get the user data
         const { data: { user }, error: userError } = await this.supabase.auth.getUser();
         if (userError || !user) {
           return { authenticated: false, user: null };
         }
         
         // Get user profile from database
         const { data: profileData, error: profileError } = await this.supabase
           .from('users')
           .select('id, email, name, role, unitId')
           .eq('supabase_auth_id', user.id)
           .single();
         
         if (profileError) {
           // Return minimal user data based on auth if profile doesn't exist
           const userData = {
             authenticated: true,
             user: {
               id: user.id,
               email: user.email || '',
               name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
               role: user.user_metadata?.role || 'STUDENT',
             }
           };
           
           // Cache this data for future use
           this.setCachedSession(userData);
           return userData;
         }
         
         // Return user data from database
         const userData = {
           authenticated: true,
           user: {
             id: profileData.id,
             email: profileData.email,
             name: profileData.name,
             role: profileData.role,
           }
         };
         
         // Cache this data for future use
         this.setCachedSession(userData);
         return userData;
       }
     }

     const response = await fetch('/api/auth/me', {
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       }
     });

     if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       // If the error is authentication-related, return appropriate response
       if (response.status === 401) {
         // Clear cache on authentication failure
         this.clearCachedSession();
         return { authenticated: false, user: null };
       }
       throw new Error(errorData.error || `Failed to fetch user data: ${response.status} ${response.statusText}`);
     }

     const data = await response.json();
     
     // Cache the comprehensive user data
     this.setCachedSession(data);
     
     return data;
   } catch (error) {
     console.error('Error fetching comprehensive user data:', error);
     // Check if this is an authentication error
     if (error instanceof Error && error.message.includes('No authentication token available')) {
       // Clear cache on authentication failure
       this.clearCachedSession();
       return { authenticated: false, user: null };
     }
     throw error;
   }
 }
 
 /**
  * Clear cached session data
  */
 clearCache() {
   this.clearCachedSession();
 }
}

export default new SupabaseAuthService();