# Colivara Search Implementation Guide

## Overview

This document provides guidance on updating the search implementation in the LSPU KMIS system to align with the official Colivara API. The current implementation uses custom API endpoints that need to be updated to use the official client library.

## Current Search Implementation

The current search functionality is implemented in `app/api/search/route.ts` and uses the custom Colivara service with methods like:
- `performSemanticSearch()`
- `performHybridSearch()`

These methods currently make direct HTTP requests to custom endpoints.

## Updated Search Implementation with Official API

### 1. Updated Colivara Service

First, we need to update the Colivara service to use the official API methods:

```typescript
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
  apiEndpoint: string; // This will be handled by the official client
  processingTimeout: number;
  maxFileSize: number;
  retryAttempts: number;
  batchSize: number;
  cacheEnabled: boolean;
  cacheTtl: number;
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
      apiEndpoint: process.env.COLIVARA_API_ENDPOINT || userConfig?.apiEndpoint || 'https://api.colivara.com/v1',
      processingTimeout: userConfig?.processingTimeout || 300000, // 5 minutes default
      maxFileSize: userConfig?.maxFileSize || 52428800, // 50MB default
      retryAttempts: userConfig?.retryAttempts || 3,
      batchSize: userConfig?.batchSize || 10,
      cacheEnabled: userConfig?.cacheEnabled ?? true,
      cacheTtl: userConfig?.cacheTtl || 3600000, // 1 hour default
    };
 }

  async initialize(): Promise<void> {
    try {
      // Check if default collection exists, create if not
      try {
        await this.client.getCollection({ collection_name: this.defaultCollection });
      } catch (error) {
        // Collection doesn't exist, create it
        await this.client.createCollection({
          name: this.defaultCollection,
          metadata: { 
            description: 'Documents for LSPU KMIS system',
            createdAt: new Date().toISOString()
          }
        });
      }
      this.isInitialized = true;
      console.log('Colivara service initialized successfully with collection:', this.defaultCollection);
    } catch (error) {
      console.error('Failed to initialize Colivara service:', error);
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Test connectivity to Colivara service
      const health = await this.client.checkHealth();
      return health.status === 'ok';
    } catch (error) {
      console.error('API key validation failed:', error);
      throw colivaraErrorHandler.convertErrorToColivaraError(error);
    }
  }

  async uploadDocument(fileUrl: string, documentId: string, metadata: DocumentMetadata): Promise<string> {
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

      // Upload document to Colivara using official API
      const document = await this.client.upsertDocument({
        name: `doc_${documentId}`,
        collection_name: this.defaultCollection,
        document_url: fileUrl, // Using URL for remote documents
        metadata: {
          originalDocumentId: documentId,
          originalName: metadata.originalName,
          size: metadata.size,
          type: metadata.type,
          extension: metadata.extension,
          uploadedAt: metadata.uploadedAt.toISOString(),
          lastModified: metadata.lastModified.toISOString(),
          hash: metadata.hash
        },
        wait: true // Wait for processing to complete
      });

      // Store the Colivara document name using raw SQL
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraDocumentId" = ${document.name}
        WHERE id = ${documentId}
      `;

      return document.name;
    } catch (error) {
      console.error(`Failed to upload document ${documentId} to Colivara:`, error);
      
      // Update document status to FAILED using raw SQL
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'FAILED', "colivaraMetadata" = ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}
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

  async checkProcessingStatus(colivaraDocumentName: string): Promise<ProcessingStatus> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // The official API doesn't have a direct status check method
      // We'll need to implement this differently, perhaps by tracking in our database
      // or using a different approach based on the document processing workflow
      
      // For now, we'll rely on the database status which is updated during document processing
      const document = await prisma.document.findUnique({
        where: { colivaraDocumentId: colivaraDocumentName }
      });
      
      if (!document) {
        throw new ColivaraProcessingError(`Document not found in database: ${colivaraDocumentName}`, colivaraDocumentName);
      }
      
      const status = (document as any).colivaraProcessingStatus;
      return {
        status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
        processedAt: (document as any).colivaraProcessedAt || undefined,
      };
    } catch (error) {
      console.error(`Failed to check processing status for ${colivaraDocumentName}:`, error);
      throw colivaraErrorHandler.convertErrorToColivaraError(error);
    }
  }

  async waitForProcessing(colivaraDocumentName: string, maxWaitTime: number = 300000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.checkProcessingStatus(colivaraDocumentName);
        
        if (status.status === 'COMPLETED') {
          return true;
        } else if (status.status === 'FAILED') {
          console.error(`Document processing failed for ${colivaraDocumentName}: ${status.error}`);
          return false;
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        console.error(`Error checking processing status for ${colivaraDocumentName}:`, error);
        return false;
      }
    }
    
    console.warn(`Processing timeout for ${colivaraDocumentName} after ${maxWaitTime}ms`);
    return false;
  }

  async performSemanticSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Apply user-specific filters if needed
      let queryFilter: any = filters || {};
      
      if (userId) {
        // We'll need to check user permissions and add appropriate filters
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
          // For non-admin/faculty users, we may need to add unit-based filters
          // This would be handled in the metadata query filter
          if (filters?.unitId) {
            queryFilter.unitId = filters.unitId;
          }
        }
      }

      const response = await this.client.search({
        query,
        collection_name: this.defaultCollection,
        top_k: 10, // Default number of results
        query_filter: queryFilter
      });

      // Format results to match our expected structure
      const results: SearchResult[] = response.map((item: any) => {
        // Extract document ID from metadata if available
        const originalDocumentId = item.metadata?.originalDocumentId || extractDocumentIdFromResult(item);
        
        return {
          documentId: originalDocumentId,
          title: item.title || item.name || `Document ${originalDocumentId}`,
          content: item.content || item.text || item.passage || '',
          score: item.score || item.similarity || item.confidence || 0,
          pageNumbers: item.page_numbers || item.pageNumbers || item.pages || [],
          documentSection: item.section || item.documentSection || item.chunk_id,
          confidenceScore: item.confidence || item.confidenceScore || item.score || 0,
          snippet: item.snippet || item.content?.substring(0, 200) + '...' || item.text?.substring(0, 200) + '...' || '',
          document: this.getDocumentById(originalDocumentId) || {} as Document,
        };
      });

      return {
        results,
        total: results.length,
        query,
        processingTime: 0, // Official API doesn't return processing time
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

  private extractDocumentIdFromResult(item: any): string {
    // Extract document ID from various possible fields in the result
    return item.document_id || 
           item.metadata?.originalDocumentId || 
           item.name?.replace('doc_', '') || 
           '';
  }

  private async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          uploadedByUser: true,
          documentUnit: true,
        }
      });

      if (!doc) return null;

      return {
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
      } as Document;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      return null;
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
        processingTime: 0, // We don't track this for combined search
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
              { tags: { path: '$[*]', string_contains: query } as any }, // Search for query string within the tags array using JSON path
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
      const exists = combined.some(semResult => semResult.documentId === tradResult.documentId);
      if (!exists) {
        combined.push(tradResult);
      }
    }
    
    // Sort by score (or some combination of scores)
    return combined.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  async indexDocument(documentId: string): Promise<boolean> {
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

      // Upload document to Colivara for processing using official API
      const colivaraDocName = await this.uploadDocument(
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
        }
      );

      // Wait for processing to complete
      const completed = await this.waitForProcessing(colivaraDocName, this.config.processingTimeout);

      if (completed) {
        // Update document with Colivara results using raw SQL
        await prisma.$executeRaw`
          UPDATE documents
          SET "colivaraDocumentId" = ${colivaraDocName},
              "colivaraProcessingStatus" = 'COMPLETED',
              "colivaraProcessedAt" = ${new Date()}::timestamp
          WHERE id = ${documentId}
        `;

        // Extract and store the processed content in ColivaraIndex
        await this.storeProcessedContent(documentId, colivaraDocName);

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

  private async storeProcessedContent(documentId: string, colivaraDocName: string): Promise<void> {
    try {
      // In the official API, we don't directly access processed content
      // Instead, we rely on the search functionality to retrieve relevant chunks
      // This method may need to be adapted or removed based on official API capabilities
      console.log(`Storing processed content for document ${documentId} with Colivara name ${colivaraDocName}`);
    } catch (error) {
      console.error(`Failed to store processed content for document ${documentId}:`, error);
      throw error;
    }
  }

  async updateIndex(documentId: string): Promise<boolean> {
    try {
      // Get the current document to check if it has changed
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return false;
      }

      return await this.indexDocument(documentId);
    } catch (error) {
      console.error(`Failed to update index for document ${documentId}:`, error);
      return false;
    }
  }

 async deleteFromIndex(documentId: string): Promise<boolean> {
    try {
      // In the official API, we would delete the document from the collection
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document || !(document as any).colivaraDocumentId) {
        // Document not processed by Colivara, just update database fields
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
      }

      // Delete from Colivara collection
      await this.client.deleteDocument({
        document_name: (document as any).colivaraDocumentId,
        collection_name: this.defaultCollection
      });

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

 async extractDocumentMetadata(colivaraDocumentName: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get document details from Colivara
      const document = await this.client.getDocument({
        document_name: colivaraDocumentName,
        collection_name: this.defaultCollection,
        expand: true
      });
      return document;
    } catch (error) {
      console.error(`Failed to extract metadata for ${colivaraDocumentName}:`, error);
      throw error;
    }
  }

  async processNewDocument(document: Document, fileUrl: string): Promise<void> {
    try {
      // This method processes a newly uploaded document
      // It will be called after a document is successfully uploaded to the system
      
      // The document should already be in the database with PENDING status
      // We just need to trigger the Colivara processing
      const success = await this.indexDocument(document.id);
      
      if (!success) {
        console.error(`Failed to process new document ${document.id} with Colivara`);
      }
    } catch (error) {
      console.error(`Error processing new document ${document.id}:`, error);
    }
  }

 async handleDocumentUpdate(documentId: string, updatedDocument: Document, fileUrl?: string): Promise<void> {
    try {
      // Handle document updates
      // If the file has changed (fileUrl is provided), reprocess the document
      if (fileUrl) {
        await this.updateIndex(documentId);
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
```

### 2. Updated Search API Route

The search API route in `app/api/search/route.ts` would need to be updated to work with the new service implementation:

```typescript
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import enhancedDocumentService from '@/lib/services/enhanced-document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import ColivaraService from '@/lib/services/colivara-service'; // Updated import

const colivaraService = new ColivaraService();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Limit to 50 max
    const unitId = searchParams.get('unit') || undefined;
    const category = searchParams.get('category') || undefined;
    const useSemantic = searchParams.get('semantic') === 'true' || true; // Default to true for semantic search
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    if (useSemantic) {
      // Use Colivara semantic search with official API
      try {
        const colivaraResults = await colivaraService.performSemanticSearch(
          query,
          { unitId, category },
          userId
        );
        
        // Format Colivara results to match expected response structure
        return NextResponse.json({
          results: colivaraResults.results,
          total: colivaraResults.total,
          page,
          limit,
          totalPages: Math.ceil(colivaraResults.total / limit),
          query: colivaraResults.query,
          processingTime: colivaraResults.processingTime,
          searchType: 'semantic',
        });
      } catch (colivaraError) {
        console.error('Colivara search failed, falling back to traditional search:', colivaraError);
        // Fall back to traditional search if Colivara fails
        const traditionalResults = await enhancedDocumentService.searchDocuments(
          query,
          unitId,
          category,
          undefined, // tags
          userId,
          page,
          limit
        );
        
        // Format traditional results to match expected response structure
        const formattedResults = traditionalResults.documents.map(doc => ({
          documentId: doc.id,
          title: doc.title,
          content: doc.description,
          score: 0.5, // Default score for traditional search
          pageNumbers: [],
          documentSection: 'description',
          confidenceScore: 0.5,
          snippet: doc.description.substring(0, 200) + '...',
          document: doc
        }));

        return NextResponse.json({
          results: formattedResults,
          total: traditionalResults.total,
          page,
          limit,
          totalPages: Math.ceil(traditionalResults.total / limit),
          query,
          processingTime: 0, // We don't track processing time for traditional search here
          searchType: 'traditional',
        });
      }
    } else {
      // Use traditional search
      const traditionalResults = await enhancedDocumentService.searchDocuments(
        query,
        unitId,
        category,
        undefined, // tags
        userId,
        page,
        limit
      );
      
      // Format traditional results to match expected response structure
      const formattedResults = traditionalResults.documents.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        content: doc.description,
        score: 0.5, // Default score for traditional search
        pageNumbers: [],
        documentSection: 'description',
        confidenceScore: 0.5,
        snippet: doc.description.substring(0, 200) + '...',
        document: doc
      }));

      return NextResponse.json({
        results: formattedResults,
        total: traditionalResults.total,
        page,
        limit,
        totalPages: Math.ceil(traditionalResults.total / limit),
        query,
        processingTime: 0, // We don't track processing time for traditional search here
        searchType: 'traditional',
      });
    }
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error during search' },
      { status: 500 }
    );
  }
}

// POST endpoint would follow the same pattern...
```

### 3. Image Search Capability

The official API also provides image search functionality:

```typescript
// Example implementation for image search
async performImageSearch(imagePath: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
  try {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const response = await this.client.searchImage({
      collection_name: this.defaultCollection,
      image_path: imagePath,
      top_k: 10,
      query_filter: filters || {}
    });

    // Format image search results
    const results: SearchResult[] = response.map((item: any) => {
      const originalDocumentId = item.metadata?.originalDocumentId || extractDocumentIdFromResult(item);
      
      return {
        documentId: originalDocumentId,
        title: item.title || item.name || `Document ${originalDocumentId}`,
        content: item.content || item.text || item.passage || '',
        score: item.score || item.similarity || item.confidence || 0,
        pageNumbers: item.page_numbers || item.pageNumbers || item.pages || [],
        documentSection: item.section || item.documentSection || item.chunk_id,
        confidenceScore: item.confidence || item.confidenceScore || item.score || 0,
        snippet: item.snippet || item.content?.substring(0, 200) + '...' || item.text?.substring(0, 200) + '...' || '',
        document: this.getDocumentById(originalDocumentId) || {} as Document,
      };
    });

    return {
      results,
      total: results.length,
      query: 'image search',
      processingTime: 0,
    };
  } catch (error) {
    console.error('Image search failed:', error);
    return {
      results: [],
      total: 0,
      query: 'image search',
      processingTime: 0,
    };
  }
}
```

## Implementation Steps

1. **Update Dependencies**: Ensure `colivara-ts` is installed and properly configured
2. **Update Service Implementation**: Replace the current Colivara service with the new implementation
3. **Update API Routes**: Modify the search API routes to use the updated service
4. **Test Integration**: Verify that all search functionality works correctly
5. **Update Documentation**: Update all relevant documentation to reflect the changes

## Considerations

1. **Collection Management**: The official API uses collections, so we need to establish a default collection for the application
2. **Error Handling**: The official client may have different error responses that need to be handled
3. **Metadata Storage**: We need to ensure document metadata is properly stored and retrieved
4. **Processing Status**: The official API may handle document processing status differently
5. **Backward Compatibility**: Ensure that existing functionality continues to work during the transition