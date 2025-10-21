// lib/api/auth-api.ts
import BaseAPI from './base-api';
import type { User } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshRequest {
  refreshToken: string;
}

class AuthAPI extends BaseAPI {
  async login(email: string, password: string): Promise<AuthResponse> {
    // In a real implementation, this would be a secure call to the backend
    // For now, we'll simulate the API call with our mock data
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    return response;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    return response;
  }

 async getUser(accessToken: string): Promise<User> {
    const response = await this.request<User>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response;
  }
}

export default AuthAPI;