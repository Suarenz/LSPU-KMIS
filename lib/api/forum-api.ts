// lib/api/forum-api.ts
import BaseAPI from './base-api';
import type { ForumPost } from '../types';

class ForumAPI extends BaseAPI {
  async getForumPosts(category?: string): Promise<ForumPost[]> {
    // For now, we'll simulate the API call with our mock data
    // In a real implementation, this would fetch from the backend
    const response = await this.request<ForumPost[]>('/forums', {
      method: 'GET',
    });
    
    // If category is specified, filter the results
    if (category && category !== 'all') {
      return response.filter(post => post.category === category);
    }
    
    return response;
  }

  async getForumPostById(id: string): Promise<ForumPost> {
    const response = await this.request<ForumPost>(`/forums/${id}`, {
      method: 'GET',
    });
    
    return response;
  }

  async createForumPost(postData: Omit<ForumPost, 'id' | 'createdAt' | 'replies' | 'likes' | 'views'>): Promise<ForumPost> {
    const response = await this.request<ForumPost>('/forums', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    
    return response;
  }

  async updateForumPost(id: string, postData: Partial<ForumPost>): Promise<ForumPost> {
    const response = await this.request<ForumPost>(`/forums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
    
    return response;
  }

  async deleteForumPost(id: string): Promise<void> {
    await this.request(`/forums/${id}`, {
      method: 'DELETE',
    });
  }

  async addReplyToPost(postId: string, replyData: Omit<ForumPost['replies'][0], 'id' | 'createdAt' | 'likes'>): Promise<ForumPost> {
    const response = await this.request<ForumPost>(`/forums/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
    
    return response;
 }
}

export default ForumAPI;