# Colivara Service Specification

## Overview
This document specifies the Colivara service layer that will handle document processing, search enhancement, and integration with the existing document management system.

## Service Interface

### ColivaraService Class Definition

```typescript
import { Document } from '@/lib/api/types';

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
```

## Core Methods

### 1. Document Processing Methods

#### uploadDocument
```typescript
async uploadDocument(fileUrl: string, documentId: string, metadata: DocumentMetadata): Promise<string>
```
- Uploads document to Colivara for processing
- Returns Colivara document ID
- Updates document processing status in database

#### checkProcessingStatus
```typescript
async checkProcessingStatus(colivaraDocumentId: string): Promise<ProcessingStatus>
```
- Checks the processing status of a document in Colivara
- Updates local database with status

#### waitForProcessing
```typescript
async waitForProcessing(colivaraDocumentId: string, maxWaitTime: number = 30000): Promise<boolean>
```
- Waits for document processing to complete (with timeout)
- Returns true if completed, false if timed out

### 2. Search Methods

#### performSemanticSearch
```typescript
async performSemanticSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults>
```
- Performs semantic search using Colivara's vision models
- Applies user permissions and filters
- Returns ranked search results

#### performHybridSearch
```typescript
async performHybridSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults>
```
- Combines semantic search with traditional database search
- Provides fallback to database search if Colivara unavailable
- Balances results from both systems

### 3. Index Management Methods

#### indexDocument
```typescript
async indexDocument(documentId: string): Promise<boolean>
```
- Processes document with Colivara and stores results in local index
- Creates entries in ColivaraIndex table
- Returns success status

#### updateIndex
```typescript
async updateIndex(documentId: string): Promise<boolean>
```
- Updates the index for a specific document
- Re-processes if document has changed

#### deleteFromIndex
```typescript
async deleteFromIndex(documentId: string): Promise<boolean>
```
- Removes document from Colivara index
- Deletes related entries from ColivaraIndex table

### 4. Utility Methods

#### extractDocumentMetadata
```typescript
async extractDocumentMetadata(colivaraDocumentId: string): Promise<any>
```
- Extracts metadata from processed document
- Returns document structure, page count, tables, images, etc.

#### validateApiKey
```typescript
async validateApiKey(): Promise<boolean>
```
- Validates the Colivara API key
- Tests connectivity to Colivara service

## Integration Methods

### 5. Document Service Integration

#### processNewDocument
```typescript
async processNewDocument(document: Document, fileUrl: string): Promise<void>
```
- Processes a newly uploaded document
- Handles the complete workflow from upload to indexing

#### handleDocumentUpdate
```typescript
async handleDocumentUpdate(documentId: string, updatedDocument: Document, fileUrl?: string): Promise<void>
```
- Handles document updates
- Re-processes if file has changed

## Error Handling

### Custom Error Types

```typescript
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
```

## Configuration

### Environment Variables
- `COLIVARA_API_KEY`: API key for Colivara service
- `COLIVARA_API_ENDPOINT`: Base URL for Colivara API
- `COLIVARA_PROCESSING_TIMEOUT`: Timeout for document processing (ms)
- `COLIVARA_MAX_FILE_SIZE`: Maximum file size for processing (bytes)
- `COLIVARA_RETRY_ATTEMPTS`: Number of retry attempts for failed requests

### Service Configuration Interface

```typescript
interface ColivaraConfig {
  apiKey: string;
  apiEndpoint: string;
  processingTimeout: number;
  maxFileSize: number;
  retryAttempts: number;
  batchSize: number;
  cacheEnabled: boolean;
  cacheTtl: number;
}
```

## Implementation Details

### Constructor
```typescript
class ColivaraService {
  private config: ColivaraConfig;
  private httpClient: any; // HTTP client instance
  private isInitialized: boolean;
  
  constructor(config?: Partial<ColivaraConfig>) {
    this.config = this.mergeConfig(config);
    this.httpClient = this.createHttpClient();
    this.isInitialized = false;
  }
  
  private mergeConfig(userConfig?: Partial<ColivaraConfig>): ColivaraConfig {
    // Merge user config with defaults
 }
  
  private createHttpClient(): any {
    // Create HTTP client with proper headers and timeout
  }
}
```

### Initialization Process
1. Validate API key
2. Test connectivity to Colivara API
3. Set up HTTP client with authentication
4. Initialize internal state

### Processing Queue Management
- Implement queue system for handling document processing
- Manage rate limits and concurrency
- Handle failed processing attempts with retry logic

### Caching Strategy
- Cache processed document metadata
- Cache search results for common queries
- Implement cache invalidation when documents are updated

## Security Considerations

### API Key Security
- Store API key securely in environment variables
- Never log API key in error messages
- Use secure transport (HTTPS) for all API calls

### Document Security
- Ensure document URLs are properly secured
- Validate document types before processing
- Implement file size limits

### Rate Limiting
- Implement client-side rate limiting
- Handle API rate limit responses gracefully
- Queue requests when limits are reached

## Performance Considerations

### Async Processing
- Process documents asynchronously to avoid blocking
- Use background jobs for heavy processing
- Implement progress tracking for long-running operations

### Result Caching
- Cache search results to improve performance
- Implement cache expiration based on document updates
- Consider using Redis or similar for distributed caching

### Batch Processing
- Process multiple documents in batches when possible
- Optimize API calls to minimize network overhead
- Implement parallel processing where appropriate

## Monitoring and Logging

### Key Metrics
- API response times
- Processing success/failure rates
- Queue length and processing times
- Cache hit/miss ratios

### Logging
- Log API requests and responses (without sensitive data)
- Track processing status changes
- Monitor error rates and patterns