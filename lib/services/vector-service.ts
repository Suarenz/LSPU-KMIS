import { Index } from '@upstash/vector';

class VectorService {
  private index: Index;

  constructor() {
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
  }

  /**
   * Add a single vector to the index
   */
  async addVector(id: string, vector: number[], data: any) {
    try {
      const result = await this.index.upsert([
        {
          id,
          vector,
          metadata: data,
        },
      ]);
      return result;
    } catch (error) {
      console.error('Error adding vector:', error);
      throw error;
    }
  }

  /**
   * Add multiple vectors to the index
   */
  async addVectors(vectors: Array<{ id: string; vector: number[]; data: any }>) {
    try {
      const formattedVectors = vectors.map(v => ({
        id: v.id,
        vector: v.vector,
        metadata: v.data,
      }));
      
      const result = await this.index.upsert(formattedVectors);
      return result;
    } catch (error) {
      console.error('Error adding vectors:', error);
      throw error;
    }
  }

  /**
   * Search for similar vectors
   */
  async searchVectors(vector: number[], topK: number = 5) {
    try {
      const result = await this.index.query({
        vector,
        topK,
        includeMetadata: true,
        includeVectors: false,
      });
      return result;
    } catch (error) {
      console.error('Error searching vectors:', error);
      throw error;
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteVectors(ids: string[]) {
    try {
      const result = await this.index.delete(ids);
      return result;
    } catch (error) {
      console.error('Error deleting vectors:', error);
      throw error;
    }
  }

 /**
   * Get vector by ID
   */
  async getVector(id: string) {
    try {
      const result = await this.index.fetch([id]);
      return result;
    } catch (error) {
      console.error('Error fetching vector:', error);
      throw error;
    }
  }

  /**
   * Get the count of vectors in the index
   */
  async countVectors() {
    try {
      const result = await this.index.info();
      return result;
    } catch (error) {
      console.error('Error getting vector count:', error);
      throw error;
    }
  }
}

export const vectorService = new VectorService();
export default VectorService;