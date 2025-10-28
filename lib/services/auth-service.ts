import { createClient } from '@/lib/supabase/client';
import { AuthResponse, User } from '@supabase/supabase-js';
import type { User as AppUser } from '../types';

interface LoginResult {
  success: boolean;
  user?: AppUser;
  error?: string;
}

class SupabaseAuthService {
  supabase;

  constructor() {
    this.supabase = createClient();
  }

  getSupabaseClient() {
    return this.supabase;
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
          .select('id, email, name, role, department')
          .eq('supabase_auth_id', data.user.id)
          .single();

        if (profileError) {
          // Check if it's a "not found" error specifically or an empty error object
          if (profileError.code === 'PGRST116' || profileError.message?.includes('not found') || (Object.keys(profileError).length === 0 && profileError.constructor === Object)) {
            console.log('User profile not found in database, creating new profile for user:', data.user.id);
            // User exists in Supabase Auth but not in our users table
            // Create a minimal profile for the user if it doesn't exist
            const { error: insertError } = await this.supabase
              .from('users')
              .insert([{
                supabase_auth_id: data.user.id,
                email: data.user.email || email,
                name: data.user.user_metadata?.name || email.split('@')[0] || email.split('@')[0],
                role: data.user.user_metadata?.role || 'STUDENT',
                department: data.user.user_metadata?.department || 'General',
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
                  department: data.user.user_metadata?.department || 'General',
                }
              };
            } else {
              console.log('New user profile created successfully during login for user:', data.user.id);
              // Profile created successfully, fetch the database ID
              const { data: newProfileData, error: newProfileError } = await this.supabase
                .from('users')
                .select('id, email, name, role, department')
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
                    department: data.user.user_metadata?.department || 'General',
                  }
                };
              }

              // Return user data with database ID
              const user = {
                id: newProfileData.id,
                email: newProfileData.email,
                name: newProfileData.name,
                role: newProfileData.role,
                department: newProfileData.department,
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
                department: data.user.user_metadata?.department || 'General',
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
          department: profileData.department,
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
      const { error: profileError } = await this.supabase
        .from('users')
        .insert([{
          supabase_auth_id: data.user.id,
          email: data.user.email,
          name: name,
          role: role as any, // Type assertion since role is properly typed at function level
          department: department || null,
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      // After successful profile creation, fetch the user's database ID to return it
      const { data: profileData, error: fetchError } = await this.supabase
        .from('users')
        .select('id, email, name, role, department')
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
            role: role as any, // Type assertion since role is properly typed at function level
            department: department,
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
          department: profileData.department,
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
      // Use getUser() instead of getSession() to authenticate the data by contacting the Supabase Auth server
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }

      // Get user profile from database to include role and other details
      // Using Promise.allSettled to run operations in parallel where possible
      const profilePromise = this.supabase
        .from('users')
        .select('id, email, name, role, department')
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
          const { error: insertError } = await this.supabase
            .from('users')
            .insert([{
              supabase_auth_id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: user.user_metadata?.role || 'STUDENT',
              department: user.user_metadata?.department || 'General',
            }]);

          if (insertError) {
            console.error('Error creating user profile after missing profile detected:', insertError);
            // Still return a minimal user object even if profile creation fails
            return {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email || 'User',
              role: user.user_metadata?.role || 'student',
              department: user.user_metadata?.department || 'General',
            };
          } else {
            console.log('New user profile created successfully for user:', user.id);
            // Profile created successfully, return it
            return {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: user.user_metadata?.role || 'STUDENT',
              department: user.user_metadata?.department || 'General',
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
            department: user.user_metadata?.department || 'General',
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
          department: profileData.department,
        };
      }

      // If no profile data but no error, return minimal user object
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email || 'User',
        role: user.user_metadata?.role || 'STUDENT',
        department: user.user_metadata?.department || 'General',
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
   // Use getUser() instead of getSession() to authenticate the data by contacting the Supabase Auth server
   const { data: { user }, error } = await this.supabase.auth.getUser();
   if (error) {
     console.error('User check error:', error);
     return false;
   }
   return user !== null;
 }

 async getAccessToken(): Promise<string | null> {
   try {
     // Try to get the session first
     const { data: { session } } = await this.supabase.auth.getSession();
     if (session?.access_token) {
       return session.access_token;
     }
     
     // If no session is available, try to get the current user and their access token
     const { data: { user } } = await this.supabase.auth.getUser();
     if (user) {
       // Get a fresh session which should refresh the access token
       const { data: { session: newSession } } = await this.supabase.auth.refreshSession();
       return newSession?.access_token || null;
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
     const token = await this.getAccessToken();
     
     if (!token) {
       // If no token is available, check if user is authenticated before throwing error
       const isAuthenticated = await this.isAuthenticated();
       if (!isAuthenticated) {
         // User is not authenticated, return null to indicate this
         return { authenticated: false, user: null };
       } else {
         // User is authenticated but we can't get a token, try alternative approach
         // Use Supabase client directly to get user data
         const { data: { user }, error: userError } = await this.supabase.auth.getUser();
         if (userError || !user) {
           throw new Error('No authentication token available and unable to get user');
         }
         
         // Get user profile from database
         const { data: profileData, error: profileError } = await this.supabase
           .from('users')
           .select('id, email, name, role, department')
           .eq('supabase_auth_id', user.id)
           .single();
         
         if (profileError) {
           // Return minimal user data based on auth if profile doesn't exist
           return {
             authenticated: true,
             user: {
               id: user.id,
               email: user.email || '',
               name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
               role: user.user_metadata?.role || 'STUDENT',
               department: user.user_metadata?.department || 'General',
             }
           };
         }
         
         // Return user data from database
         return {
           authenticated: true,
           user: {
             id: profileData.id,
             email: profileData.email,
             name: profileData.name,
             role: profileData.role,
             department: profileData.department,
           }
         };
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
       throw new Error(errorData.error || `Failed to fetch user data: ${response.status} ${response.statusText}`);
     }

     const data = await response.json();
     return data;
   } catch (error) {
     console.error('Error fetching comprehensive user data:', error);
     // Check if this is an authentication error
     if (error instanceof Error && error.message.includes('No authentication token available')) {
       return { authenticated: false, user: null };
     }
     throw error;
   }
 }
}

export default new SupabaseAuthService();