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
  const [isLoading, setIsLoading] = useState<boolean>(typeof window === 'undefined') // Only set to true on client
  const [error, setError] = useState<string | null>(null)
  
  // Initialize AuthService after component mounts to ensure window is available
  const [authService, setAuthService] = useState<AuthService | null>(null)

  useEffect(() => {
    // Initialize AuthService after component mounts to ensure window is available
    if (typeof window !== 'undefined') {
      const authServiceInstance = new AuthService();
      setAuthService(authServiceInstance);
      
      // On initial client mount, load auth state
      const initAuth = async () => {
        setIsLoading(true);
        try {
          const currentUser = await authServiceInstance.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };

      // Only run auth initialization on the client side
      initAuth();
    }
  }, []); // Empty dependency array since we only want to run this once on mount

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!authService) {
      setError('Authentication service not initialized');
      setIsLoading(false);
      return { success: false, error: 'Authentication service not initialized' };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
      } else {
        setError(result.error || 'Login failed');
        return result;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (!authService) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
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
