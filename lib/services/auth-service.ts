// lib/services/auth-service.ts
import type { User } from '../types';
import AuthAPI from '../api/auth-api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

class AuthService {
  private api: AuthAPI;
  private tokens: AuthTokens | null = null;
  private tokenRefreshPromise: Promise<AuthResponse> | null = null;

  constructor() {
    // Only initialize the API and load tokens if running in browser environment
    if (typeof window !== 'undefined') {
      this.api = new AuthAPI();
      this.loadTokens();
    } else {
      // In server environment, create a dummy API instance to prevent errors
      this.api = {} as AuthAPI;
    }
  }

  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kmis_auth_tokens');
      if (stored) {
        try {
          this.tokens = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to parse stored tokens:', error);
          localStorage.removeItem('kmis_auth_tokens');
        }
      }
    }
  }

  private saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;
    this.tokens = { accessToken, refreshToken, expiresAt };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('kmis_auth_tokens', JSON.stringify(this.tokens));
    }
  }

  private clearTokens(): void {
    this.tokens = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kmis_auth_tokens');
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.expiresAt;
  }

  private async refreshTokens(): Promise<AuthResponse> {
    // For the mock implementation, we'll simulate token refresh without making API calls
    // In a real implementation, this would be an actual API call to refresh tokens
    if (!this.tokens || !this.tokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Simulate refresh by creating new mock tokens
    try {
      const storedUser = await this.getCurrentUser() || this.getStoredUser(); // Get user from storage
      if (!storedUser) {
        throw new Error('No user data available for refresh');
      }

      const mockResponse: AuthResponse = {
        user: storedUser,
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresIn: 3600, // 1 hour
      };
      
      this.saveTokens(mockResponse.accessToken, mockResponse.refreshToken, mockResponse.expiresIn);
      return mockResponse;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const currentUser = localStorage.getItem('kmis_current_user');
      if (currentUser) {
        return JSON.parse(currentUser) as User;
      }
      return null;
    } catch (error) {
      console.error('Failed to get stored user:', error);
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // For the simulation, we'll return mock data that matches the expected API response format
      // In a real implementation, this would be an actual API call
      const mockUsers: Record<string, { password: string; user: User }> = {
        "admin@lspu.edu.ph": {
          password: "admin123",
          user: {
            id: "1",
            email: "admin@lspu.edu.ph",
            name: "Admin User",
            role: "admin",
            department: "IT Department",
          },
        },
        "faculty@lspu.edu.ph": {
          password: "faculty123",
          user: {
            id: "2",
            email: "faculty@lspu.edu.ph",
            name: "Dr. Maria Santos",
            role: "faculty",
            department: "Computer Science",
          },
        },
        "student@lspu.edu.ph": {
          password: "student123",
          user: {
            id: "3",
            email: "student@lspu.edu.ph",
            name: "Juan Dela Cruz",
            role: "student",
            department: "Computer Science",
          },
        },
        "external@partner.com": {
          password: "external123",
          user: {
            id: "4",
            email: "external@partner.com",
            name: "External Partner",
            role: "external",
            department: "Research Collaboration",
          },
        },
      };

      const userRecord = mockUsers[email];
      if (userRecord && userRecord.password === password) {
        // Simulate API response with tokens
        const mockResponse: AuthResponse = {
          user: userRecord.user,
          accessToken: `mock_access_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
          expiresIn: 3600, // 1 hour
        };
        
        this.saveTokens(mockResponse.accessToken, mockResponse.refreshToken, mockResponse.expiresIn);
        // Store the current user in localStorage for retrieval during initialization
        if (typeof window !== 'undefined') {
          localStorage.setItem('kmis_current_user', JSON.stringify(mockResponse.user));
        }
        return { success: true, user: mockResponse.user };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async logout(): Promise<void> {
    // Only perform logout if in browser environment
    if (typeof window !== 'undefined' && this.tokens && this.tokens.refreshToken) {
      try {
        await this.api.logout(this.tokens.refreshToken);
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with local cleanup even if API call fails
      }
    }
    
    this.clearTokens();
    // Clear the current user from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kmis_current_user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // For mock implementation, we'll retrieve user data from localStorage
    // rather than making an API call since we don't have a real backend
    try {
      // In the mock implementation, we store the current user in localStorage
      if (typeof window === 'undefined') return null;
      const currentUser = localStorage.getItem('kmis_current_user');
      if (currentUser) {
        return JSON.parse(currentUser) as User;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user from local storage:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (!this.tokens) {
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      return false;
    }
    
    return true;
  }

  private async refresh(): Promise<AuthResponse> {
    // Prevent multiple simultaneous refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.refreshTokens();
    
    try {
      const result = await this.tokenRefreshPromise;
      return result;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  getAccessToken(): string | null {
    if (!this.tokens) {
      return null;
    }
    
    if (this.isTokenExpired()) {
      return null;
    }
    
    return this.tokens.accessToken;
  }
}

export default AuthService;