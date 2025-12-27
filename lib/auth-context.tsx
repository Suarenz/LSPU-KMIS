"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import AuthService from "./services/auth-service"

interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
 isAuthenticated: boolean
 isLoading: boolean
 error: string | null
}

// Create a default context value to prevent hydration errors
const defaultContextValue: AuthContextType = {
 user: null,
  login: async () => ({ success: false, error: 'Auth service not initialized' }),
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with default values that match between server and client
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Start as true initially
 const [error, setError] = useState<string | null>(null)
  
  // Initialize AuthService after component mounts to ensure window is available
  const [authService] = useState(AuthService);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    // Immediately check session on mount to get initial state quickly
    const checkInitialSession = async () => {
      try {
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise<any>((resolve) => {
          setTimeout(() => {
            resolve({ authenticated: false, user: null });
          }, 8000); // 8 second timeout for initial auth check
        });
        
        // Race between the actual check and the timeout
        const comprehensiveData = await Promise.race([
          authService.getComprehensiveUserData(),
          timeoutPromise
        ]);
        
        if (!isMounted) return;
        
        if (comprehensiveData && comprehensiveData.authenticated) {
          // Set basic auth state immediately to prevent loading
          setIsAuthenticated(true);
          setUser(comprehensiveData.user);
          setIsLoading(false);
        } else {
          // Not authenticated - this is the normal case for new users
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initial session check error:', err);
        if (isMounted) {
          // On error, assume not authenticated and allow user to proceed
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    // Add page visibility change handler to prevent loading state on tab focus
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Only validate if it's been more than 10 minutes since last check
        const lastChecked = authService.getLastAuthCheck();
        const now = Date.now();
        
        // Only re-validate if more than 10 minutes have passed
        if (!lastChecked || (now - lastChecked) > 10 * 60 * 1000) {
          // Perform lightweight session validation without showing loading
          try {
            const isValid = await authService.validateSessionWithoutLoading();
            if (!isValid) {
              // Session is no longer valid, clear user state
              if (isMounted) {
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          } catch (err) {
            console.error('Session validation error on visibility change:', err);
          }
          // Update last check timestamp
          authService.setLastAuthCheck(now);
        }
      }
    };

    // Run initial session check
    if (typeof window !== 'undefined') {
      // Add a small delay to ensure React hydration is complete
      const timer = setTimeout(() => {
        if (isMounted) {
          checkInitialSession();
        }
      }, 0);
      
      // Add visibility change listener
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearTimeout(timer);
        isMounted = false;
        
        // Remove visibility change listener
        if (typeof window !== 'undefined') {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
    } else {
      // For server-side rendering, set initial state and return
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }
}, []); // Empty dependency array since we only want to run this once on mount

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        // Set user and authentication state immediately to allow faster redirects
        setUser(result.user);
        setIsAuthenticated(true);
        setIsLoading(false); // Set loading to false after successful login
        return result;
      } else {
        setError(result.error || 'Login failed');
        setIsLoading(false); // Explicitly set loading to false on error
        return result;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      setIsLoading(false); // Explicitly set loading to false on error
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      // Clear user state immediately to allow faster UI updates
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // During server-side rendering, return the default context value
    // This prevents the error while maintaining type safety
    if (typeof window === 'undefined') {
      return defaultContextValue;
    } else {
      throw new Error("useAuth must be used within an AuthProvider")
    }
  }
  return context
}
