// lib/api/base-api.ts
import type { ForumPost } from '../types';

class BaseAPI {
  protected baseUrl: string;
  protected headers: HeadersInit;

  // Internal mock forum posts data
  private mockForumPosts: ForumPost[] = [];

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
    // For the mock implementation, we'll handle authentication and forum endpoints locally
    // without making actual HTTP requests since there's no real backend server
    if (endpoint.startsWith('/auth/')) {
      return this.handleMockAuthRequest<T>(endpoint, options);
    } else if (endpoint.startsWith('/forums')) {
      return this.handleMockForumRequest<T>(endpoint, options);
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

  private async handleMockForumRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate API delays
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock responses based on the endpoint
    if (endpoint === '/forums' && options.method === 'GET') {
      // Return all forum posts
      return this.mockForumPosts as unknown as T;
    } else if (endpoint.startsWith('/forums/') && endpoint.includes('/replies') && options.method === 'POST') {
      // Add a reply to a forum post
      const postId = endpoint.split('/')[2]; // Get the post ID from the URL
      const replyData = JSON.parse(options.body as string);
      const updatedPosts = [...this.mockForumPosts];
      const postIndex = updatedPosts.findIndex(post => post.id === postId);
      
      if (postIndex !== -1) {
        const newReply = {
          ...replyData,
          id: `reply_${Date.now()}`,
          createdAt: new Date(),
          likes: 0,
        };
        updatedPosts[postIndex].replies.push(newReply);
        return updatedPosts[postIndex] as unknown as T;
      }
    } else if (endpoint.startsWith('/forums/') && options.method === 'GET') {
      // Get a specific forum post by ID
      const postId = endpoint.split('/')[2]; // Get the post ID from the URL
      const post = this.mockForumPosts.find(post => post.id === postId);
      if (post) {
        return post as unknown as T;
      }
      throw new Error('Forum post not found');
    } else if (endpoint === '/forums' && options.method === 'POST') {
      // Create a new forum post
      const postData = JSON.parse(options.body as string);
      const newPost = {
        ...postData,
        id: `post_${Date.now()}`,
        createdAt: new Date(),
        replies: [],
        likes: 0,
        views: 0,
      };
      // Update the mock data to include the new post
      this.mockForumPosts.push(newPost);
      return newPost as unknown as T;
    }

    throw new Error(`Unknown forum endpoint: ${endpoint}`);
  }
}

export default BaseAPI;