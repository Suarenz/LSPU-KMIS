import { redisService } from './redis-service';

interface QProCacheConfig {
  uploadCacheTtl: number; // TTL for upload metadata cache in seconds
  analysisCacheTtl: number; // TTL for analysis results cache in seconds
  processingStatusTtl: number; // TTL for processing status cache in seconds
}

interface QProUploadCache {
  documentId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: Date;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

interface QProAnalysisCache {
  documentId: string;
  analysisId: string;
  status: string;
  achievementScore?: number;
  kras?: any[];
  activities?: any[];
  timestamp?: number;
}

class QProCacheService {
  private readonly config: QProCacheConfig = {
    uploadCacheTtl: 60 * 60, // 1 hour for upload metadata
    analysisCacheTtl: 24 * 60 * 60, // 24 hours for analysis results
    processingStatusTtl: 30 * 60, // 30 minutes for processing status
  };

  constructor(config?: Partial<QProCacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Generate cache key for QPRO upload
   */
  private generateUploadCacheKey(documentId: string): string {
    return `qpro:upload:${documentId}`;
  }

  /**
   * Generate cache key for QPRO analysis
   */
  private generateAnalysisCacheKey(documentId: string): string {
    return `qpro:analysis:${documentId}`;
  }

  /**
   * Generate cache key for QPRO processing status
   */
  private generateProcessingStatusCacheKey(analysisId: string): string {
    return `qpro:processing:${analysisId}`;
  }

  /**
   * Generate cache key for user's QPRO analyses list
   */
  private generateUserAnalysesCacheKey(userId: string): string {
    return `qpro:user:${userId}:analyses`;
  }

  /**
   * Cache upload metadata
   */
  async cacheUpload(uploadData: QProUploadCache): Promise<void> {
    try {
      const cacheKey = this.generateUploadCacheKey(uploadData.documentId);
      await redisService.set(cacheKey, uploadData, this.config.uploadCacheTtl);
      console.log(`[QPRO Cache] Cached upload for document: ${uploadData.documentId}`);
    } catch (error) {
      console.error('[QPRO Cache] Error caching upload:', error);
      // Don't throw - cache is optional
    }
  }

  /**
   * Get cached upload metadata
   */
  async getUploadCache(documentId: string): Promise<QProUploadCache | null> {
    try {
      const cacheKey = this.generateUploadCacheKey(documentId);
      const cached = await redisService.get<QProUploadCache>(cacheKey);
      if (cached) {
        console.log(`[QPRO Cache] Hit for upload: ${documentId}`);
      }
      return cached;
    } catch (error) {
      console.error('[QPRO Cache] Error retrieving upload cache:', error);
      return null;
    }
  }

  /**
   * Cache QPRO analysis result
   */
  async cacheAnalysis(analysisData: QProAnalysisCache): Promise<void> {
    try {
      const cacheKey = this.generateAnalysisCacheKey(analysisData.documentId);
      const dataWithTimestamp = { ...analysisData, timestamp: Date.now() };
      await redisService.set(cacheKey, dataWithTimestamp, this.config.analysisCacheTtl);
      console.log(`[QPRO Cache] Cached analysis for document: ${analysisData.documentId}`);
    } catch (error) {
      console.error('[QPRO Cache] Error caching analysis:', error);
      // Don't throw - cache is optional
    }
  }

  /**
   * Get cached analysis result
   */
  async getAnalysisCache(documentId: string): Promise<QProAnalysisCache | null> {
    try {
      const cacheKey = this.generateAnalysisCacheKey(documentId);
      const cached = await redisService.get<QProAnalysisCache>(cacheKey);
      if (cached) {
        console.log(`[QPRO Cache] Hit for analysis: ${documentId}`);
      }
      return cached;
    } catch (error) {
      console.error('[QPRO Cache] Error retrieving analysis cache:', error);
      return null;
    }
  }

  /**
   * Update processing status cache
   */
  async updateProcessingStatus(analysisId: string, status: string, progress?: number): Promise<void> {
    try {
      const cacheKey = this.generateProcessingStatusCacheKey(analysisId);
      const statusData = { analysisId, status, progress: progress || 0, timestamp: Date.now() };
      await redisService.set(cacheKey, statusData, this.config.processingStatusTtl);
      console.log(`[QPRO Cache] Updated processing status for analysis: ${analysisId} - ${status}`);
    } catch (error) {
      console.error('[QPRO Cache] Error updating processing status:', error);
      // Don't throw - cache is optional
    }
  }

  /**
   * Get processing status from cache
   */
  async getProcessingStatus(analysisId: string): Promise<{ status: string; progress?: number } | null> {
    try {
      const cacheKey = this.generateProcessingStatusCacheKey(analysisId);
      const cached = await redisService.get<any>(cacheKey);
      if (cached) {
        console.log(`[QPRO Cache] Hit for processing status: ${analysisId}`);
        return { status: cached.status, progress: cached.progress };
      }
      return null;
    } catch (error) {
      console.error('[QPRO Cache] Error retrieving processing status:', error);
      return null;
    }
  }

  /**
   * Cache user's QPRO analyses list
   */
  async cacheUserAnalyses(userId: string, analyses: any[]): Promise<void> {
    try {
      const cacheKey = this.generateUserAnalysesCacheKey(userId);
      await redisService.set(cacheKey, { analyses, timestamp: Date.now() }, this.config.analysisCacheTtl);
      console.log(`[QPRO Cache] Cached ${analyses.length} analyses for user: ${userId}`);
    } catch (error) {
      console.error('[QPRO Cache] Error caching user analyses:', error);
      // Don't throw - cache is optional
    }
  }

  /**
   * Get cached user analyses list
   */
  async getUserAnalysesCache(userId: string): Promise<any[] | null> {
    try {
      const cacheKey = this.generateUserAnalysesCacheKey(userId);
      const cached = await redisService.get<{ analyses: any[] }>(cacheKey);
      if (cached) {
        console.log(`[QPRO Cache] Hit for user analyses: ${userId}`);
        return cached.analyses;
      }
      return null;
    } catch (error) {
      console.error('[QPRO Cache] Error retrieving user analyses cache:', error);
      return null;
    }
  }

  /**
   * Invalidate upload cache for a document
   */
  async invalidateUploadCache(documentId: string): Promise<void> {
    try {
      const cacheKey = this.generateUploadCacheKey(documentId);
      await redisService.del(cacheKey);
      console.log(`[QPRO Cache] Invalidated upload cache for document: ${documentId}`);
    } catch (error) {
      console.error('[QPRO Cache] Error invalidating upload cache:', error);
    }
  }

  /**
   * Invalidate analysis cache for a document
   */
  async invalidateAnalysisCache(documentId: string): Promise<void> {
    try {
      const cacheKey = this.generateAnalysisCacheKey(documentId);
      await redisService.del(cacheKey);
      console.log(`[QPRO Cache] Invalidated analysis cache for document: ${documentId}`);
    } catch (error) {
      console.error('[QPRO Cache] Error invalidating analysis cache:', error);
    }
  }

  /**
   * Invalidate processing status cache
   */
  async invalidateProcessingStatus(analysisId: string): Promise<void> {
    try {
      const cacheKey = this.generateProcessingStatusCacheKey(analysisId);
      await redisService.del(cacheKey);
      console.log(`[QPRO Cache] Invalidated processing status for analysis: ${analysisId}`);
    } catch (error) {
      console.error('[QPRO Cache] Error invalidating processing status:', error);
    }
  }

  /**
   * Invalidate user's analyses cache
   */
  async invalidateUserAnalysesCache(userId: string): Promise<void> {
    try {
      const cacheKey = this.generateUserAnalysesCacheKey(userId);
      await redisService.del(cacheKey);
      console.log(`[QPRO Cache] Invalidated user analyses cache for user: ${userId}`);
    } catch (error) {
      console.error('[QPRO Cache] Error invalidating user analyses cache:', error);
    }
  }

  /**
   * Clear all QPRO caches for a user
   */
  async invalidateAllUserCaches(userId: string): Promise<void> {
    try {
      const pattern = `qpro:user:${userId}:*`;
      const keys = await redisService.keys(pattern);
      if (keys.length > 0) {
        for (const key of keys) {
          await redisService.del(key);
        }
        console.log(`[QPRO Cache] Invalidated ${keys.length} caches for user: ${userId}`);
      }
    } catch (error) {
      console.error('[QPRO Cache] Error invalidating all user caches:', error);
    }
  }

  /**
   * Get cache statistics for QPRO
   */
  async getCacheStats(): Promise<{ size: number; keys: string[] }> {
    try {
      const keys = await redisService.keys('qpro:*');
      return {
        size: keys.length,
        keys,
      };
    } catch (error) {
      console.error('[QPRO Cache] Error getting cache stats:', error);
      return { size: 0, keys: [] };
    }
  }
}

// Export singleton instance
export const qproCacheService = new QProCacheService();
export { QProCacheService };
