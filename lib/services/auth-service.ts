import type { User as AppUser } from '../types';
import jwtService from './jwt-service';

interface LoginResult {
  success: boolean;
  user?: AppUser;
  error?: string;
}

// Cache configuration
const SESSION_CACHE_KEY = 'lspu_kmis_session_cache';
const LAST_CHECK_KEY = 'lspu_kmis_last_auth_check';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class DatabaseAuthService {
  private sessionValidationDebounce: NodeJS.Timeout | null = null;

  constructor() {
    // No external client initialization needed
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
         const token = this.getAccessTokenFromStorage();
         if (!token) {
           resolve(false);
           return;
         }

         // Check if we're in the browser environment
         if (typeof window !== 'undefined') {
           // In browser, check if token is expired without full verification
           const isExpired = jwtService.isTokenExpired(token);
           if (isExpired) {
             // Try to refresh the token
             const refreshed = await this.refreshToken();
             resolve(refreshed);
           } else {
             resolve(true);
           }
         } else {
           // On server, verify the JWT token
           jwtService.verifyToken(token).then(decoded => {
             resolve(!!decoded);
           }).catch(() => resolve(false));
         }
       } catch (error) {
         console.error('Session validation error:', error);
         resolve(false);
       }
     }, 500); // Only validate after 500ms of inactivity
   });
 }

  private getAccessTokenFromStorage(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private setAccessTokenInStorage(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private removeAccessTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Call the API route to perform login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || 'Login failed' };
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Store the access token in localStorage
        this.setAccessTokenInStorage(data.token);
        
        // Generate a mock refresh token and store it
        const refreshToken = this.generateMockRefreshToken();
        localStorage.setItem('refresh_token', refreshToken);
        
        // Store refresh token in mock store
        this.refreshTokensStore.set(refreshToken, {
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role
        });

        // Return user data
        const userData: AppUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL',
          unitId: data.user.unitId || undefined,
        };

        return {
          success: true,
          user: userData,
        };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  }

  async signup(email: string, password: string, name: string, role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL' = 'STUDENT', department?: string): Promise<LoginResult> {
    try {
      // Call the API route to perform signup
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role, department }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || 'Signup failed' };
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Store the access token in localStorage
        this.setAccessTokenInStorage(data.token);
        
        // Generate a mock refresh token and store it
        const refreshToken = this.generateMockRefreshToken();
        localStorage.setItem('refresh_token', refreshToken);
        
        // Store refresh token in mock store
        this.refreshTokensStore.set(refreshToken, {
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role
        });

        // Return user data
        const userData: AppUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL',
          unitId: data.user.unitId || undefined,
        };

        return {
          success: true,
          user: userData,
        };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred during signup' };
    }
 }

  async logout(): Promise<void> {
    try {
      // Call the API route to perform logout (optional - mainly for server-side cleanup)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessTokenFromStorage()}`
        },
      });

      // Remove the tokens from localStorage
      const refreshToken = localStorage.getItem('refresh_token');
      this.removeAccessTokenFromStorage();
      localStorage.removeItem('refresh_token');
      
      // Remove refresh token from mock store if it exists
      if (refreshToken) {
        this.refreshTokensStore.delete(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the tokens from localStorage even if API call fails
      const refreshToken = localStorage.getItem('refresh_token');
      this.removeAccessTokenFromStorage();
      localStorage.removeItem('refresh_token');
      
      // Remove refresh token from mock store if it exists
      if (refreshToken) {
        this.refreshTokensStore.delete(refreshToken);
      }
    }
  }

  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const token = this.getAccessTokenFromStorage();
      if (!token) {
        return null;
      }

      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        // In browser, check if token is expired without full verification
        const isExpired = jwtService.isTokenExpired(token);
        if (isExpired) {
          // Try to refresh the token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Get the new token after refresh
            const refreshedToken = this.getAccessTokenFromStorage();
            if (refreshedToken) {
              // Fetch user data from the API route with the refreshed token
              const response = await fetch('/api/auth/me', {
                headers: {
                  'Authorization': `Bearer ${refreshedToken}`,
                  'Content-Type': 'application/json',
                }
              });
              
              if (!response.ok) {
                return null;
              }
              
              const data = await response.json();
              if (data.user) {
                return {
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.name,
                  role: data.user.role as 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL',
                  unitId: data.user.unitId || undefined,
                };
              } else {
                return null;
              }
            } else {
              return null; // If no new token after refresh, return null
            }
          } else {
            return null; // If refresh failed, return null
          }
        }
      } else {
        // On server, verify the JWT token
        const decoded = await jwtService.verifyToken(token);
        if (!decoded) {
          return null;
        }
      }

      // Fetch user data from the API route
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // If the response is 401 (unauthorized), try to refresh the token
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // If token was refreshed, try the request again
            const newToken = this.getAccessTokenFromStorage();
            if (newToken) {
              const retryResponse = await fetch('/api/auth/me', {
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                }
              });
              
              if (!retryResponse.ok) {
                return null;
              }
              
              const retryData = await retryResponse.json();
              if (retryData.user) {
                return {
                  id: retryData.user.id,
                  email: retryData.user.email,
                  name: retryData.user.name,
                  role: retryData.user.role as 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL',
                  unitId: retryData.user.unitId || undefined,
                };
              }
            }
          }
        }
        return null;
      }

      const data = await response.json();

      if (data.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL',
          unitId: data.user.unitId || undefined,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  async getSession() {
    const token = this.getAccessTokenFromStorage();
    if (!token) {
      return null;
    }

    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // In browser, decode token without verification
      const decoded = jwtService.decodeToken(token);
      if (!decoded) {
        // If we can't decode the token, try to refresh it
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = this.getAccessTokenFromStorage();
          if (newToken) {
            const newDecoded = jwtService.decodeToken(newToken);
            return newDecoded ? { access_token: newToken, expires_at: newDecoded.exp } : null;
          }
        }
        return null;
      }
      return decoded ? { access_token: token, expires_at: decoded.exp } : null;
    } else {
      // On server, verify the JWT token
      const decoded = await jwtService.verifyToken(token);
      if (!decoded) {
        // If token verification fails, try to refresh it
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = this.getAccessTokenFromStorage();
          if (newToken) {
            const newDecoded = await jwtService.verifyToken(newToken);
            return newDecoded ? { access_token: newToken, expires_at: newDecoded.exp } : null;
          }
        }
        return null;
      }
      return decoded ? { access_token: token, expires_at: decoded.exp } : null;
    }
  }

  async getUser() {
    return await this.getCurrentUser();
  }

  // Mock refresh token store - in a real implementation this would be a database
  private refreshTokensStore: Map<string, { userId: string; email: string; role: string }> = new Map();

  generateMockRefreshToken(): string {
    // Generate a mock refresh token
    return `mock_refresh_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  async refreshToken(): Promise<boolean> {
    try {
      // Get the refresh token from storage
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      // Call the refresh endpoint
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // If refresh fails, clear all tokens
        this.removeAccessTokenFromStorage();
        localStorage.removeItem('refresh_token');
        // Remove refresh token from mock store if it exists
        this.refreshTokensStore.delete(refreshToken);
        return false;
      }

      const data = await response.json();
      if (data.token) {
        // Store the new access token
        this.setAccessTokenInStorage(data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { error: 'User not authenticated' };
      }

      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        // If the response is 401 (unauthorized), try to refresh the token
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Get the new token after refresh
            const newToken = await this.getAccessToken();
            if (newToken) {
              // Try the request again with the new token
              const retryResponse = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${newToken}`
                },
                body: JSON.stringify({ newPassword }),
              });

              if (!retryResponse.ok) {
                const errorData = await retryResponse.json().catch(() => ({}));
                return { error: errorData.error || 'Failed to update password' };
              }

              return { error: null };
            }
          }
        }
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.error || 'Failed to update password' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error: 'Failed to update password' };
    }
  }

  async resetPassword(email: string) {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.error || 'Failed to reset password' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: 'Failed to reset password' };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = this.getAccessTokenFromStorage();
      if (!token) {
        return false;
      }

      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        // In browser, check if token is expired without full verification
        const isExpired = jwtService.isTokenExpired(token);
        if (isExpired) {
          // Try to refresh the token
          const refreshed = await this.refreshToken();
          return refreshed;
        }
        return true;
      } else {
        // On server, verify the JWT token
        const decoded = await jwtService.verifyToken(token);
        return !!decoded;
      }
    } catch (error) {
      console.error('Error in isAuthenticated:', error);
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const token = this.getAccessTokenFromStorage();
      if (!token) {
        return null;
      }

      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        // In browser, check if token is expired without full verification
        const isExpired = jwtService.isTokenExpired(token);
        if (isExpired) {
          // Try to refresh the token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Get the new token after refresh
            const newToken = this.getAccessTokenFromStorage();
            return newToken;
          } else {
            return null; // If refresh failed, return null
          }
        }
        return token;
      } else {
        // On server, verify the JWT token
        const decoded = await jwtService.verifyToken(token);
        return decoded ? token : null;
      }
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
          // User is authenticated but we can't get a token, return not authenticated
          return { authenticated: false, user: null };
        }
      }
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        // If the error is authentication-related, try to refresh the token
        if (response.status === 401 || response.status === 404) {
          // Try to refresh the token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Get the new token after refresh
            const refreshedToken = await this.getAccessToken();
            if (refreshedToken) {
              // Try the request again with the refreshed token
              const retryResponse = await fetch('/api/auth/me', {
                headers: {
                  'Authorization': `Bearer ${refreshedToken}`,
                  'Content-Type': 'application/json',
                }
              });
              
              if (!retryResponse.ok) {
                // Clear cache on authentication failure
                this.clearCachedSession();
                return { authenticated: false, user: null };
              }
              
              const retryData = await retryResponse.json();
              // Cache the comprehensive user data
              this.setCachedSession(retryData);
              return retryData;
            }
          }
          // Clear cache on authentication failure
          this.clearCachedSession();
          return { authenticated: false, user: null };
        }
        const errorData = await response.json().catch(() => ({}));
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
      // For any other error, return not authenticated to prevent the error from propagating
      this.clearCachedSession();
      return { authenticated: false, user: null };
    }
  }

  /**
   * Clear cached session data
   */
  clearCache() {
    this.clearCachedSession();
  }
}

export default new DatabaseAuthService();