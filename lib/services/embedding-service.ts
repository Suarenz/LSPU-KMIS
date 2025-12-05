import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
      baseURL: process.env.OPENAI_BASE_URL, // Use the OpenRouter endpoint
    });
  }

  /**
   * Generate embeddings for a single text
   */
 async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002', // This is a common embedding model
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // OpenAI allows up to 2048 texts in a single request
      // For simplicity, we'll process them individually for now
      const embeddings: number[][] = [];
      
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();
export default EmbeddingService;