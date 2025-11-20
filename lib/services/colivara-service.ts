import { ColiVara } from 'colivara-ts';
import prisma from '@/lib/prisma';
import { Document } from '@/lib/api/types';
import { ColivaraDocument, ColivaraIndex } from '@/lib/types/colivara-types';
import { colivaraErrorHandler, ColivaraError as ColivaraServiceError, ColivaraErrorType } from './colivara-error-handler';

interface DocumentMetadata {
  originalName: string;
  size: number;
  type: string;
  extension: string;
  uploadedAt: Date;
 lastModified: Date;
  hash: string;
}

interface ProcessingStatus {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  error?: string;
  processedAt?: Date;
  num_pages?: number;  // Add page count field
}

interface SearchFilters {
  unitId?: string;
  category?: string;
  dateRange?: { start: Date; end: Date };
  fileType?: string[];
}

interface SearchResults {
  results: SearchResult[];
  total: number;
  query: string;
 processingTime: number;
}

interface SearchResult {
  documentId: string;
  title: string;
  content: string;
  score: number;
  pageNumbers: number[];
  documentSection?: string;
  confidenceScore?: number;
  snippet: string;
 document: Document;
}

interface ColivaraConfig {
  apiKey: string;
  processingTimeout: number;
  maxFileSize: number;
  retryAttempts: number;
  batchSize: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  defaultCollection: string;
}

class ColivaraError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'ColivaraError';
 }
}

class ColivaraApiError extends ColivaraError {
  constructor(message: string, public response?: any) {
    super(message, 'API_ERROR', response?.status);
    this.name = 'ColivaraApiError';
  }
}

class ColivaraProcessingError extends ColivaraError {
  constructor(message: string, public documentId: string) {
    super(message, 'PROCESSING_ERROR');
    this.name = 'ColivaraProcessingError';
  }
}

class ColivaraService {
  private client: ColiVara;
  private config: ColivaraConfig;
  private isInitialized: boolean;
  private defaultCollection: string = 'lspu-kmis-documents';

  constructor(config?: Partial<ColivaraConfig>) {
    this.config = this.mergeConfig(config);
    this.client = new ColiVara(this.config.apiKey);
    this.isInitialized = false;
  }

  private mergeConfig(userConfig?: Partial<ColivaraConfig>): ColivaraConfig {
    return {
      apiKey: process.env.COLIVARA_API_KEY || userConfig?.apiKey || '',
      processingTimeout: userConfig?.processingTimeout || 300000, // 5 minutes default
      maxFileSize: userConfig?.maxFileSize || 52428800, // 50MB default
      retryAttempts: userConfig?.retryAttempts || 3,
      batchSize: userConfig?.batchSize || 10,
      cacheEnabled: userConfig?.cacheEnabled ?? true,
      cacheTtl: userConfig?.cacheTtl || 3600000, // 1 hour default
      defaultCollection: userConfig?.defaultCollection || 'lspu-kmis-documents',
    };
  }

  async initialize(): Promise<void> {
    try {
      // Validate API key by checking health
      await this.validateApiKey();
      
      // Ensure the default collection exists
      await this.ensureDefaultCollection();
      
      this.isInitialized = true;
      console.log('Colivara service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Colivara service:', error);
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Test connectivity to Colivara service using the health check
      if (typeof this.client.checkHealth !== 'function') {
        throw new ColivaraApiError('Colivara client does not have a checkHealth method');
      }
      await this.client.checkHealth();
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      throw colivaraErrorHandler.convertErrorToColivaraError(error);
    }
  }

  private async ensureDefaultCollection(): Promise<void> {
    try {
      // Try to get the collection first
      if (typeof this.client.getCollection !== 'function') {
        throw new ColivaraApiError('Colivara client does not have a getCollection method');
      }
      
      try {
        await this.client.getCollection({ collection_name: this.config.defaultCollection });
        console.log(`Collection '${this.config.defaultCollection}' already exists`);
      } catch (error) {
        // Check if the error is because the method doesn't exist or collection doesn't exist
        if (error instanceof TypeError || (error instanceof Error && error.message.includes('method'))) {
          throw error; // Re-throw if it's a method not found error
        }
        
        // If collection doesn't exist, create it
        console.log(`Creating collection '${this.config.defaultCollection}'`);
        
        if (typeof this.client.createCollection !== 'function') {
          throw new ColivaraApiError('Colivara client does not have a createCollection method');
        }
        
        await this.client.createCollection({
          name: this.config.defaultCollection,
          metadata: {
            description: 'Default collection for LSPU KMIS documents',
            created_at: new Date().toISOString()
          }
        });
        console.log(`Collection '${this.config.defaultCollection}' created successfully`);
      }
    } catch (error) {
      console.error(`Failed to ensure default collection exists:`, error);
      throw error;
    }
  }

  async uploadDocument(fileUrl: string, documentId: string, metadata: DocumentMetadata, base64Content?: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Update document status to PROCESSING using raw SQL since Prisma client hasn't been updated
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'PROCESSING', "colivaraChecksum" = ${metadata.hash}
        WHERE id = ${documentId}
      `;

      // Check if the upsertDocument method exists
      if (typeof this.client.upsertDocument !== 'function') {
        throw new ColivaraApiError('Colivara client does not have an upsertDocument method');
      }
      
      // Validate document metadata before upload
      if (!documentId || typeof documentId !== 'string') {
        throw new ColivaraApiError('Invalid document ID provided for upload');
      }

      // Validate document name
      const documentName = `${documentId}_${metadata.originalName}`;
      if (!documentName || documentName.length > 255) {
        throw new ColivaraApiError('Document name is invalid or too long');
      }

      // Validate collection name
      if (!this.config.defaultCollection || typeof this.config.defaultCollection !== 'string') {
        throw new ColivaraApiError('Invalid collection name provided');
      }

      // Prepare upload parameters
      const uploadParams: any = {
        name: documentName,
        collection_name: this.config.defaultCollection,
        metadata: {
          documentId,
          ...metadata
        },
        wait: false // Don't wait for processing to complete, we'll check status separately
      };

      // If base64 content is provided, use it instead of the URL
      if (base64Content) {
        console.log('Uploading document with base64 content:', {
          name: documentName,
          collection_name: this.config.defaultCollection,
          metadata: {
            documentId,
            ...metadata
          }
        });
        uploadParams.document_base64 = base64Content; // Use document_base64 instead of content for Colivara API
      } else {
        // If no base64 content provided, use the URL (fallback for backward compatibility)
        if (!fileUrl || typeof fileUrl !== 'string') {
          throw new ColivaraApiError('Invalid file URL provided for upload');
        }
        console.log('Uploading document with URL:', {
          name: documentName,
          collection_name: this.config.defaultCollection,
          document_url: fileUrl,
          metadata: {
            documentId,
            ...metadata
          }
        });
        uploadParams.document_url = fileUrl;
      }

      const response = await this.client.upsertDocument(uploadParams);

      console.log('Upload response received:', response);

      // Extract document ID from response - adjust based on actual API response structure
      // Ensure we return a string value, not the entire response object
      const responseObj = response as any;
      const documentIdFromResponse = responseObj.id || responseObj.documentId || responseObj.name ||
                                    (typeof response === 'string' ? response : documentName);

      if (!documentIdFromResponse) {
        throw new ColivaraApiError('Invalid response from upsertDocument - no document ID returned');
      }

      // Validate that the document ID is a proper string
      if (typeof documentIdFromResponse !== 'string' || documentIdFromResponse === '[object Object]') {
        throw new ColivaraApiError(`Invalid document ID returned from API: ${typeof documentIdFromResponse}`);
      }

      // Store the Colivara document ID using raw SQL
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraDocumentId" = ${documentIdFromResponse}
        WHERE id = ${documentId}
      `;

      return documentIdFromResponse;
    } catch (error) {
      console.error(`Failed to upload document ${documentId} to Colivara:`, error);
      
      // Update document status to FAILED using raw SQL
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'FAILED', "colivaraMetadata" = ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}::jsonb
        WHERE id = ${documentId}
      `;

      if (error instanceof ColivaraError) {
        throw error;
      }

      throw new ColivaraProcessingError(
        `Failed to upload document to Colivara: ${error instanceof Error ? error.message : 'Unknown error'}`,
        documentId
      );
    }
  }

  async checkProcessingStatus(colivaraDocumentId: string): Promise<ProcessingStatus> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate that colivaraDocumentId is actually a string, not an object
      if (typeof colivaraDocumentId !== 'string' || colivaraDocumentId === '[object Object]' || !colivaraDocumentId) {
        throw new ColivaraApiError('Invalid document ID provided to checkProcessingStatus');
      }

      console.log(`Checking processing status for document ID: ${colivaraDocumentId}`);

      if (typeof this.client.getDocument !== 'function') {
        throw new ColivaraApiError('Colivara client does not have a getDocument method');
      }
      
      const response = await this.client.getDocument({
        document_name: colivaraDocumentId,
        collection_name: this.config.defaultCollection  // Include collection name in the request
      });

      console.log(`Processing status response for ${colivaraDocumentId}:`, response);

      // Handle the response based on the actual ColiVara API response structure
      // Since we don't have exact type information, we'll access fields safely
      return {
        status: (response as any).status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' || 'PENDING',
        progress: (response as any).progress || 0,
        error: (response as any).error,
        processedAt: (response as any).processedAt ? new Date((response as any).processedAt) : undefined,
        num_pages: (response as any).num_pages || (response as any).pages || (response as any).page_count || 0,  // Add page count information
      };
    } catch (error) {
      console.error(`Failed to check processing status for ${colivaraDocumentId}:`, error);
      
      // Convert error to ColivaraError to check if it's a 404
      const colivaraError = colivaraErrorHandler.convertErrorToColivaraError(error);
      
      // If it's a document not found error, return appropriate status
      if (colivaraError.type === ColivaraErrorType.DOCUMENT_NOT_FOUND) {
        console.warn(`Document ${colivaraDocumentId} not found in Colivara collections`);
        return {
          status: 'FAILED',
          error: `Document not found in Colivara: ${colivaraError.message}`,
          processedAt: new Date(),
        };
      }
      
      // For other errors, log them and re-throw
      console.error(`Error checking processing status for ${colivaraDocumentId}:`, colivaraError);
      throw colivaraError;
    }
  }

  async waitForProcessing(colivaraDocumentId: string, maxWaitTime: number = 3000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    // Add a 2-second delay before starting the status check loop
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Waiting 2 seconds before starting status check for document: ${colivaraDocumentId}`);

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.checkProcessingStatus(colivaraDocumentId);
        
        if (status.status === 'COMPLETED' || (status.num_pages !== undefined && status.num_pages > 0)) {
          return true;
        } else if (status.status === 'FAILED') {
          console.error(`Document processing failed for ${colivaraDocumentId}: ${status.error}`);
          return false;
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        console.error(`Error checking processing status for ${colivaraDocumentId}:`, error);
        // If the error is due to document not being found, return false immediately
        if (error instanceof ColivaraServiceError && (error as any).type === ColivaraErrorType.DOCUMENT_NOT_FOUND) {
          console.error(`Document ${colivaraDocumentId} not found in Colivara, failing immediately`);
          return false;
        }
        return false;
      }
    }
    
    console.warn(`Processing timeout for ${colivaraDocumentId} after ${maxWaitTime}ms`);
    return false;
  }

  async performSemanticSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const startTime = Date.now();
      
      let response;
      
      // Check if the search method exists on the client
      if (typeof this.client.search !== 'function') {
        console.warn('Colivara client does not have a search method, falling back to traditional search');
        return {
          results: [],
          total: 0,
          query,
          processingTime: 0,
        };
      }
      
      try {
        response = await this.client.search({
          query,
          collection_name: this.config.defaultCollection,
          top_k: 10 // Return top 10 results
          // Note: Filters are not directly supported in the search call,
          // they would need to be implemented using metadata filtering if available in the actual API
        });
      } catch (error) {
        console.error('Colivara search API call failed:', error);
        // Return empty results but don't throw, let the fallback mechanism handle it
        return {
          results: [],
          total: 0,
          query,
          processingTime: 0,
        };
      }
      const processingTime = Date.now() - startTime;

      // Format results to match our expected structure
      const results: SearchResult[] = response.results.map((item: any) => {
        // Extract the original document ID from multiple possible locations
        let originalDocumentId = item.metadata?.documentId ||
                                (item.document && item.document.metadata?.documentId) ||
                                item.metadata?.id ||
                                item.id;
                                
        // If still not found, try to extract from document_metadata in the document object
        if (!originalDocumentId && item.document && item.document_metadata) {
          originalDocumentId = item.document.document_metadata.documentId;
        }
        
        // If still not found, try to extract directly from document_metadata property
        if (!originalDocumentId && item.document_metadata) {
          originalDocumentId = item.document_metadata.documentId;
        }
        
        // If still not found, try to extract from the document name (which contains the document ID)
        if (!originalDocumentId && item.document?.document_name) {
          // Extract document ID from document_name which is in format "docId_originalName.ext"
          const nameParts = item.document.document_name.split('_');
          if (nameParts.length >= 1) {
            originalDocumentId = nameParts[0];
          }
        }
                                  
        return {
          documentId: originalDocumentId,
          title: item.title || item.metadata?.originalName || item.metadata?.title || item.name || 'Untitled Document',
          content: item.content || item.text || item.metadata?.content || '',
          score: item.score || item.similarity || item.confidence || 0,
          pageNumbers: item.page_numbers || item.pageNumbers || item.pages || [item.document?.page_number] || [],
          documentSection: item.section || item.documentSection || item.metadata?.section || '',
          confidenceScore: item.confidence_score || item.confidenceScore || item.confidence || item.score || 0,
          snippet: item.snippet || item.content?.substring(0, 200) + '...' || item.text?.substring(0, 200) + '...' || item.metadata?.content?.substring(0, 200) + '...' || '',
          document: item.document || item.metadata?.document || item || {} as Document,
        };
      });

      return {
        results,
        total: results.length,
        query,
        processingTime,
      };
    } catch (error) {
      console.error('Semantic search failed:', error);
      // Return an empty result set in case of error
      return {
        results: [],
        total: 0,
        query,
        processingTime: 0,
      };
    }
  }

  async performHybridSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Perform semantic search with Colivara
      const semanticResults = await this.performSemanticSearch(query, filters, userId);

      // Perform traditional database search
      const traditionalResults = await this.performTraditionalSearch(query, filters, userId);

      // Combine and rank results
      const combinedResults = this.combineSearchResults(semanticResults, traditionalResults);

      return {
        results: combinedResults,
        total: combinedResults.length,
        query,
        processingTime: semanticResults.processingTime + (traditionalResults as any).processingTime || 0,
      };
    } catch (error) {
      console.error('Hybrid search failed:', error);
      // Fallback to traditional search only
      return await this.performTraditionalSearch(query, filters, userId);
    }
  }

  private async performTraditionalSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
    // This would use the existing search functionality from enhanced-document-service
    // For now, we'll implement a basic version
    const documents = await prisma.document.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { path: ['$[*]'], string_contains: query } as any }, // Search for query string within the tags array using JSON path as array
            ]
          },
          filters?.unitId ? { unitId: filters.unitId } : {},
          filters?.category ? { category: filters.category } : {},
        ],
        status: 'ACTIVE',
      },
      include: {
        uploadedByUser: true,
        documentUnit: true,
      },
      take: 50, // Limit to 50 results
    });

    const results: SearchResult[] = documents.map((doc: any) => ({
      documentId: doc.id,
      title: doc.title,
      content: doc.description,
      score: 0.5, // Default score for traditional search
      pageNumbers: [],
      documentSection: 'description',
      confidenceScore: 0.5,
      snippet: doc.description.substring(0, 200) + '...',
      document: {
        ...doc,
        tags: Array.isArray(doc.tags) ? doc.tags as string[] : [],
        uploadedBy: doc.uploadedByUser?.name || doc.uploadedBy,
        unit: doc.documentUnit ? {
          id: doc.documentUnit.id,
          name: doc.documentUnit.name,
          code: doc.documentUnit.code,
          description: doc.documentUnit.description || undefined,
          createdAt: doc.documentUnit.createdAt,
          updatedAt: doc.documentUnit.updatedAt,
        } : undefined,
        uploadedAt: new Date(doc.uploadedAt),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
        // Colivara fields (for consistency)
        colivaraDocumentId: doc.colivaraDocumentId ?? undefined,
        colivaraProcessingStatus: doc.colivaraProcessingStatus as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' ?? undefined,
        colivaraProcessedAt: doc.colivaraProcessedAt ? new Date(doc.colivaraProcessedAt) : undefined,
        colivaraChecksum: doc.colivaraChecksum ?? undefined,
      } as Document,
    }));

    return {
      results,
      total: results.length,
      query,
      processingTime: 0, // We don't track this for traditional search here
    };
  }

  private combineSearchResults(semanticResults: SearchResults, traditionalResults: SearchResults): SearchResult[] {
   // This is a simplified combination - in a real implementation, we would have more sophisticated ranking
   const combined = [...semanticResults.results];
   
   // Add traditional results that aren't already in semantic results
   for (const tradResult of traditionalResults.results) {
     // Check if document already exists in combined results using documentId field
     const exists = combined.some(semResult => {
       const semDocId = semResult.documentId;
       const tradDocId = tradResult.documentId;
       return semDocId && tradDocId && semDocId === tradDocId;
     });
     if (!exists) {
       combined.push(tradResult);
     }
   }
   
   // Sort by score (or some combination of scores)
   return combined.sort((a, b) => (b.score || 0) - (a.score || 0));
 }

  async indexDocument(documentId: string, base64Content?: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get document from database
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          uploadedByUser: true,
          documentUnit: true,
        }
      });

      if (!document) {
        throw new ColivaraProcessingError(`Document not found: ${documentId}`, documentId);
      }

      // Update document status to PROCESSING using raw SQL
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'PROCESSING'
        WHERE id = ${documentId}
      `;

      // Upload document to Colivara for processing
      const colivaraDocId = await this.uploadDocument(
        document.fileUrl,
        documentId,
        {
          originalName: document.fileName,
          size: document.fileSize,
          type: document.fileType,
          extension: document.fileName.split('.').pop() || '',
          uploadedAt: document.uploadedAt,
          lastModified: document.updatedAt,
          hash: (document as any).colivaraChecksum || ''
        },
        base64Content // Pass the base64 content if provided
      );

      console.log('Upload result from upsertDocument:', { colivaraDocId, documentId });

      // Wait for processing to complete
      const completed = await this.waitForProcessing(colivaraDocId, this.config.processingTimeout);

      if (completed) {
        // Update document with Colivara results using raw SQL
        await prisma.$executeRaw`
          UPDATE documents
          SET "colivaraDocumentId" = ${colivaraDocId},
              "colivaraProcessingStatus" = 'COMPLETED',
              "colivaraProcessedAt" = ${new Date()}::timestamp
          WHERE id = ${documentId}
        `;

        // Extract and store the processed content in ColivaraIndex
        await this.storeProcessedContent(documentId, colivaraDocId);

        return true;
      } else {
        // Handle timeout or failure
        await prisma.$executeRaw`
          UPDATE documents
          SET "colivaraProcessingStatus" = 'FAILED'
          WHERE id = ${documentId}
        `;
        
        return false;
      }
    } catch (error) {
      console.error(`Failed to index document ${documentId}:`, error);
      
      // Update document status to FAILED using raw SQL
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'FAILED'
        WHERE id = ${documentId}
      `;
      
      return false;
    }
  }

  private async storeProcessedContent(documentId: string, colivaraDocId: string): Promise<void> {
    try {
      // Get the processed content from Colivara
      // Note: The official API might not have a direct content endpoint
      // We'll need to implement this based on what the actual API provides
      console.log(`Storing processed content for document ${documentId} with Colivara ID ${colivaraDocId}`);
      
      // For now, we'll just log this operation
      // The actual implementation would depend on what data the Colivara API returns
      // after document processing is complete
    } catch (error) {
      console.error(`Failed to store processed content for document ${documentId}:`, error);
      throw error;
    }
  }

   async updateIndex(documentId: string, base64Content?: string): Promise<boolean> {
     try {
       // Get the current document to check if it has changed
       const document = await prisma.document.findUnique({
         where: { id: documentId }
       });
 
       if (!document) {
         return false;
       }
 
       // Check if we need to reprocess (e.g., if file has changed)
       // For now, we'll just reprocess - we'll need to implement proper change detection
       // once the Prisma client is updated with new fields
       if ((document as any).colivaraProcessingStatus === 'COMPLETED' && (document as any).colivaraChecksum) {
         // In a real implementation, we would check if the file has changed
         // For now, we'll just reprocess
       }
 
       return await this.indexDocument(documentId, base64Content);
     } catch (error) {
       console.error(`Failed to update index for document ${documentId}:`, error);
       return false;
     }
   }

  async deleteFromIndex(documentId: string): Promise<boolean> {
    try {
      // Delete all index entries for this document using raw SQL
      await prisma.$executeRaw`
        DELETE FROM colivara_indexes WHERE "documentId" = ${documentId}
      `;

      // Update document to reset Colivara fields using raw SQL
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraDocumentId" = NULL,
            "colivaraEmbeddings" = NULL,
            "colivaraMetadata" = NULL,
            "colivaraProcessingStatus" = NULL,
            "colivaraProcessedAt" = NULL,
            "colivaraChecksum" = NULL
        WHERE id = ${documentId}
      `;

      return true;
    } catch (error) {
      console.error(`Failed to delete document ${documentId} from index:`, error);
      return false;
    }
  }

  async extractDocumentMetadata(colivaraDocumentId: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate that colivaraDocumentId is actually a string, not an object
      if (typeof colivaraDocumentId !== 'string' || colivaraDocumentId === '[object Object]') {
        throw new ColivaraApiError('Invalid document ID provided to extractDocumentMetadata');
      }

      if (typeof this.client.getDocument !== 'function') {
        throw new ColivaraApiError('Colivara client does not have a getDocument method');
      }
      
      const response = await this.client.getDocument({
        document_name: colivaraDocumentId,
        collection_name: this.config.defaultCollection  // Include collection name in the request
      });
      return response.metadata || response;
    } catch (error) {
      console.error(`Failed to extract metadata for ${colivaraDocumentId}:`, error);
      throw error;
    }
  }

  async processNewDocument(document: Document, fileUrl: string, base64Content?: string): Promise<void> {
    try {
      // This method processes a newly uploaded document
      // It will be called after a document is successfully uploaded to the system
      
      // The document should already be in the database with PENDING status
      // We just need to trigger the Colivara processing
      const success = await this.indexDocument(document.id, base64Content);
      
      if (!success) {
        console.error(`Failed to process new document ${document.id} with Colivara`);
      }
    } catch (error) {
      console.error(`Error processing new document ${document.id}:`, error);
    }
 }

  async handleDocumentUpdate(documentId: string, updatedDocument: Document, fileUrl?: string, base64Content?: string): Promise<void> {
    try {
      // Handle document updates
      // If the file has changed (fileUrl is provided), reprocess the document
      if (fileUrl) {
        // Use updateIndex which will call indexDocument with the base64 content if provided
        const success = await this.updateIndex(documentId, base64Content);
        if (!success) {
          console.error(`Failed to reprocess updated document ${documentId} with Colivara`);
        }
      } else {
        // If only metadata changed, we might need to update the index differently
        // For now, just return
        return;
      }
    } catch (error) {
      console.error(`Error handling document update for ${documentId}:`, error);
    }
  }
}

export default ColivaraService;