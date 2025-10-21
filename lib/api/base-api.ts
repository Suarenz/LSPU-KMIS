// lib/api/base-api.ts
class BaseAPI {
  protected baseUrl: string;
  protected headers: HeadersInit;

  constructor() {
    // Check if running in browser before accessing window
    const defaultUrl = typeof window !== 'undefined'
      ? 'http://localhost:3001/api'
      : 'http://localhost:3001/api';
      
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || defaultUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // For the mock implementation, we'll handle authentication endpoints locally
    // without making actual HTTP requests since there's no real backend server
    if (endpoint.startsWith('/auth/')) {
      return this.handleMockAuthRequest<T>(endpoint, options);
    }

    // Check if fetch is available (it's not available during SSR)
    if (typeof fetch === 'undefined') {
      throw new Error('Fetch API is not available during server-side rendering');
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...this.headers,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  }

  private async handleMockAuthRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate API delays
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock responses based on the endpoint
    if (endpoint === '/auth/me') {
      // For /auth/me, we'll return the user stored in localStorage
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem('kmis_current_user');
        if (currentUser) {
          return JSON.parse(currentUser) as unknown as T;
        }
      }
      throw new Error('User not found');
    } else if (endpoint === '/auth/login') {
      // Login is handled in the AuthService, so this shouldn't be called directly
      // But if it is, we'll return a mock response
      throw new Error('Login should be handled by AuthService directly');
    } else if (endpoint === '/auth/logout') {
      // For logout, we just return success
      return {} as T;
    } else if (endpoint === '/auth/refresh') {
      // For refresh, we return mock tokens
      return {
        user: {},
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresIn: 3600,
      } as T;
    }

    throw new Error(`Unknown auth endpoint: ${endpoint}`);
  }
}

export default BaseAPI;