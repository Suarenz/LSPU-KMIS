# Colivara Integration Implementation Guide

## Overview

This document provides a comprehensive guide to implementing the Colivara integration in the LSPU KMIS system using the official Colivara API. The integration will enhance document search capabilities using AI-powered semantic search.

## Current State Analysis

### Existing Implementation
- Database schema includes Colivara fields in the `Document` model
- Custom HTTP client implementation for Colivara API calls
- Search API endpoints implemented with fallback mechanisms
- Document processing workflow with status tracking

### Issues with Current Implementation
- Uses custom HTTP client instead of official `colivara-ts` library
- Custom API endpoints that don't align with official API
- Potential maintenance challenges with custom implementation
- Missing official API features like collections, image search, etc.

## Official Colivara API Features

### Client Initialization
```typescript
import { ColiVara } from 'colivara-ts';

const client = new ColiVara('your-api-key');
```

### Collections API
- `createCollection({ name, metadata? })`
- `getCollection({ collection_name })`
- `listCollections()`
- `deleteCollection({ collection_name })`
- `partialUpdateCollection({ collection_name, name?, metadata? })`

### Documents API
- `upsertDocument({ name, metadata?, collection_name?, document_url?, document_base64?, document_path?, wait?, use_proxy? })`
- `getDocument({ document_name, collection_name?, expand? })`
- `listDocuments({ collection_name?, expand? })`
- `deleteDocument({ document_name, collection_name? })`
- `partialUpdateDocument({ document_name, ...options })`

### Search API
- `search({ query, collection_name?, top_k?, query_filter? })`
- `searchImage({ collection_name, image_path?, image_base64?, top_k?, query_filter? })`

### Embeddings API
- `createEmbedding({ input_data, task? })`

### Other APIs
- Webhooks: `addWebhook({ url })`, `validateWebhook({ webhook_secret, payload, headers })`
- Health: `checkHealth()`

## Implementation Plan

### Phase 1: Setup and Configuration

1. **Verify Installation**
   - Ensure `colivara-ts` is installed in the project
   - Verify version compatibility

2. **Environment Configuration**
   ```
   COLIVARA_API_KEY="your-colivara-api-key-here"
   COLIVARA_API_ENDPOINT="https://api.colivara.com/v1"  # This will be handled by the official client
   COLIVARA_PROCESSING_TIMEOUT=300000
   ```

3. **Collection Setup**
   - Create a default collection for the LSPU KMIS documents
   - Name: `lspu-kmis-documents`
   - Metadata: Description and creation timestamp

### Phase 2: Service Implementation

1. **Update Colivara Service**
   - Replace custom HTTP client with official API client
   - Implement all required methods using official API
   - Maintain backward compatibility for database interactions

2. **Document Processing**
   - Use `upsertDocument` for document uploads
   - Implement proper metadata handling
   - Maintain status tracking in the database

3. **Search Implementation**
   - Use `search` method for semantic search
   - Implement hybrid search combining semantic and traditional approaches
   - Add image search capability using `searchImage`

### Phase 3: API Route Updates

1. **Update Search API**
   - Modify `app/api/search/route.ts` to use updated service
   - Maintain same response format for frontend compatibility
   - Implement fallback to traditional search if Colivara fails

2. **Error Handling**
   - Implement proper error handling for official API responses
   - Maintain existing fallback mechanisms

### Phase 4: Testing and Validation

1. **Unit Tests**
   - Update tests to work with official API methods
   - Mock official API calls for testing

2. **Integration Tests**
   - Test document processing workflow
   - Test search functionality with various query types
   - Test error handling and fallback mechanisms

3. **Performance Testing**
   - Measure search response times
   - Test with various document types and sizes

## Updated Service Implementation

The updated Colivara service should implement the following structure:

```typescript
import { ColiVara } from 'colivara-ts';
import prisma from '@/lib/prisma';
import { Document } from '@/lib/api/types';
import { ColivaraDocument, ColivaraIndex } from '@/lib/types/colivara-types';
import { colivaraErrorHandler, ColivaraError as ColivaraServiceError, ColivaraErrorType } from './colivara-error-handler';

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

  // Initialize collection and verify API access
  async initialize(): Promise<void> {
    // Implementation as shown in previous document
  }

  // Upload document using official API
  async uploadDocument(fileUrl: string, documentId: string, metadata: DocumentMetadata): Promise<string> {
    // Implementation using client.upsertDocument()
  }

  // Perform semantic search using official API
  async performSemanticSearch(query: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
    // Implementation using client.search()
  }

  // Perform image search using official API
  async performImageSearch(imagePath: string, filters?: SearchFilters, userId?: string): Promise<SearchResults> {
    // Implementation using client.searchImage()
  }

  // Additional methods using official API...
}
```

## Database Schema Considerations

The current database schema is well-designed for the integration:

```prisma
model Document {
  // ... existing fields ...
  
  // Colivara-specific fields
  colivaraDocumentId       String?
  colivaraEmbeddings       Json?
  colivaraMetadata         Json?
  colivaraProcessingStatus String?              @default("PENDING")
  colivaraProcessedAt      DateTime?
  colivaraChecksum         String?
  colivaraIndexes          ColivaraIndex[]
}

model ColivaraIndex {
  id              String   @id @default(cuid())
  documentId      String
  chunkId         String?
  content         String
  embeddings      Json
 pageNumbers     Int[]
  documentSection String?
  confidenceScore Float?
  createdAt       DateTime @default(now())
  document        Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
}
```

## Migration Strategy

### Option 1: Complete Replacement (Recommended)
1. Create new service implementation using official API
2. Update all references to use new service
3. Test thoroughly before deploying
4. Remove old implementation after successful migration

### Option 2: Gradual Migration
1. Keep both implementations during transition
2. Gradually move functionality to official API
3. Monitor performance and errors
4. Remove old implementation after verification

## Error Handling and Fallbacks

The updated implementation should maintain the existing robust error handling:

1. **API Connectivity**: Check health status before operations
2. **Rate Limiting**: Implement proper retry mechanisms
3. **Fallback Search**: Maintain traditional search when Colivara fails
4. **Status Tracking**: Update database status for processing monitoring
5. **Logging**: Comprehensive logging for debugging and monitoring

## Security Considerations

1. **API Key Management**: Store API keys securely in environment variables
2. **Document Access**: Ensure proper access controls for processed documents
3. **Metadata Privacy**: Be mindful of sensitive information in document metadata
4. **Rate Limiting**: Implement proper rate limiting to prevent abuse

## Performance Optimization

1. **Caching**: Implement caching for frequent searches
2. **Batch Processing**: Process multiple documents efficiently
3. **Connection Pooling**: Optimize API connection management
4. **Result Pagination**: Implement proper pagination for large result sets

## Testing Strategy

### Unit Tests
- Test each service method individually
- Mock official API responses
- Test error handling scenarios

### Integration Tests
- Test complete document processing workflow
- Test search functionality with real documents
- Test fallback mechanisms

### End-to-End Tests
- Test document upload and processing
- Test search from frontend to backend
- Test error scenarios and recovery

## Deployment Considerations

1. **Environment Setup**: Ensure API keys are properly configured
2. **Database Migration**: Verify all Colivara fields are present
3. **Service Initialization**: Ensure collection is created during startup
4. **Monitoring**: Set up monitoring for API usage and errors

## Rollback Plan

In case of issues after deployment:

1. **Immediate Rollback**: Switch back to traditional search only
2. **Service Disable**: Disable Colivara integration while fixing issues
3. **Data Recovery**: Ensure no data loss during rollback
4. **Communication**: Inform users about any service changes

## Success Metrics

1. **Search Performance**: Measure response times and relevance
2. **Processing Success Rate**: Track document processing success/failure rates
3. **User Adoption**: Monitor usage of enhanced search features
4. **System Reliability**: Track error rates and downtime

## Maintenance and Updates

1. **API Versioning**: Monitor for official API updates
2. **Performance Monitoring**: Regularly review search performance
3. **Security Updates**: Keep dependencies updated
4. **Documentation**: Maintain updated documentation for the team

## Conclusion

Implementing the official Colivara API will provide better reliability, maintainability, and access to the latest features. The migration should be done carefully with proper testing to ensure no disruption to existing functionality.

The key benefits of this approach include:
- Reduced maintenance overhead
- Access to official support
- Better error handling
- Latest API features
- Improved reliability