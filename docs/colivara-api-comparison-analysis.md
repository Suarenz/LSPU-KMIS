# Colivara API Comparison Analysis

## Overview

This document analyzes the differences between the current Colivara service implementation in the LSPU KMIS system and the official Colivara API documentation provided.

## Current Implementation vs Official API

### 1. API Client Usage

**Current Implementation:**
- Uses a custom HTTP client with manual API calls
- Direct fetch requests to `/documents`, `/search`, etc. endpoints
- Manual error handling and response parsing

**Official API:**
- Uses the official `colivara-ts` client library
- `new ColiVara('your-api-key')` initialization
- Method calls like `client.createCollection()`, `client.upsertDocument()`, etc.

### 2. Collection Management

**Current Implementation:**
- No explicit collection management
- Documents are processed directly without collections

**Official API:**
- `createCollection({ name, metadata? })`
- `getCollection({ collection_name })`
- `listCollections()`
- `deleteCollection({ collection_name })`
- `partialUpdateCollection({ collection_name, name?, metadata? })`

### 3. Document Management

**Current Implementation:**
- `uploadDocument(fileUrl, documentId, metadata)` - uploads to `/documents` endpoint
- Custom document processing workflow
- Manual status tracking in database

**Official API:**
- `upsertDocument({ name, metadata?, collection_name?, document_url?, document_base64?, document_path?, wait?, use_proxy? })`
- `getDocument({ document_name, collection_name?, expand? })`
- `listDocuments({ collection_name?, expand? })`
- `deleteDocument({ document_name, collection_name? })`
- `partialUpdateDocument({ document_name, ...options })`

### 4. Search Functionality

**Current Implementation:**
- `performSemanticSearch(query, filters?, userId?)` - calls `/search` endpoint
- `performHybridSearch(query, filters?, userId?)` - combines semantic and traditional search
- Custom search result formatting

**Official API:**
- `search({ query, collection_name?, top_k?, query_filter? })`
- `searchImage({ collection_name, image_path?, image_base64?, top_k?, query_filter? })`

### 5. Embeddings

**Current Implementation:**
- No explicit embeddings API methods
- Embeddings are stored in database fields

**Official API:**
- `createEmbedding({ input_data, task? })`

### 6. Other APIs

**Official API Only:**
- Webhooks: `addWebhook({ url })`, `validateWebhook({ webhook_secret, payload, headers })`
- Health: `checkHealth()`

## Recommendations for Implementation

### 1. Update Colivara Service

The current service implementation needs significant updates to align with the official API:

```typescript
import { ColiVara } from 'colivara-ts';

class ColivaraService {
  private client: ColiVara;
  private config: ColivaraConfig;
  private isInitialized: boolean;

  constructor(config?: Partial<ColivaraConfig>) {
    this.config = this.mergeConfig(config);
    this.client = new ColiVara(this.config.apiKey);
    this.isInitialized = false;
  }

  // Initialize collection for the application
  async initialize(): Promise<void> {
    try {
      // Check if default collection exists, create if not
      try {
        await this.client.getCollection({ collection_name: 'lspu-kmis-documents' });
      } catch (error) {
        // Collection doesn't exist, create it
        await this.client.createCollection({
          name: 'lspu-kmis-documents',
          metadata: { description: 'Documents for LSPU KMIS system' }
        });
      }
      this.isInitialized = true;
      console.log('Colivara service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Colivara service:', error);
      throw error;
    }
  }

  // Upload document using official API
  async uploadDocument(documentId: string, filePath: string, metadata?: any): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Update document status to PROCESSING using raw SQL since Prisma client hasn't been updated
      await prisma.$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'PROCESSING'
        WHERE id = ${documentId}
      `;

      const document = await this.client.upsertDocument({
        name: `doc_${documentId}`,
        collection_name: 'lspu-kmis-documents',
        document_path: filePath,
        metadata: {
          originalDocumentId: documentId,
          ...metadata
        }
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

      throw error;
    }
  }

  // Search using official API
 async performSemanticSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Apply user-specific filters if needed
      if (userId) {
        // We'll need to check user permissions and add appropriate filters
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
          // For non-admin/faculty users, we may need to add unit-based filters
          // This would be handled in the metadata query filter
        }
      }

      const response = await this.client.search({
        query,
        collection_name: 'lspu-kmis-documents',
        top_k: 10, // Default number of results
        query_filter: filters || {}
      });

      // Format results to match our expected structure
      const results: SearchResult[] = response.map((item: any) => ({
        documentId: item.document_id || item.name,
        title: item.title || item.name,
        content: item.content || item.text || '',
        score: item.score || item.similarity || 0,
        pageNumbers: item.page_numbers || item.pageNumbers || [],
        documentSection: item.section || item.documentSection,
        confidenceScore: item.confidence || item.confidenceScore,
        snippet: item.snippet || item.content?.substring(0, 200) + '...' || '',
        document: item.document || {} as Document,
      }));

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

  // Additional methods would follow the same pattern...
}
```

### 2. Update Search API Route

The search API route in `app/api/search/route.ts` would need to use the updated service methods that leverage the official API.

### 3. Update Document Processing Workflow

The document processing workflow would need to adapt to the official API's collection-based approach, where documents are organized within collections rather than being processed individually.

## Migration Steps

1. **Install Official Client**: Ensure `colivara-ts` is properly installed and configured
2. **Update Service Implementation**: Replace custom HTTP client with official API client
3. **Collection Setup**: Initialize a default collection for the application
4. **Update Document Processing**: Modify document upload to use collections
5. **Update Search**: Adapt search functionality to use official search methods
6. **Update Tests**: Modify integration tests to work with the new API
7. **Update Documentation**: Update all documentation to reflect the new implementation

## Benefits of Using Official API

1. **Reliability**: Official client handles edge cases and API changes
2. **Maintenance**: Less custom code to maintain
3. **Features**: Access to all official API features
4. **Updates**: Automatic compatibility with API updates
5. **Support**: Official support for the client library