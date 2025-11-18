# Colivara Integration Plan

## Overview
This document outlines the integration of Colivara's vision-based document processing capabilities into the LSPU KMIS system. Colivara will replace traditional text extraction and OCR methods with advanced vision models for better document understanding and search capabilities.

## Current System Architecture
- Document storage: Azure Blob Storage
- Database: PostgreSQL with Prisma ORM
- Search: Basic full-text search on title, description, and tags
- Frontend: Next.js with TypeScript

## Database Schema Modifications

### Document Model Changes
The following fields need to be added to the Document model in `prisma/schema.prisma`:

```
model Document {
  // ... existing fields ...
  
  // Colivara-specific fields
  colivaraDocumentId    String?    // Unique identifier from Colivara
  colivaraEmbeddings    Json?      // Document embeddings for semantic search
  colivaraMetadata      Json?      // Additional metadata extracted by Colivara
  colivaraProcessingStatus String? @default("PENDING") // Processing status: PENDING, PROCESSING, COMPLETED, FAILED
 colivaraProcessedAt   DateTime? // Timestamp when processing was completed
  colivaraChecksum      String?    // Checksum to track document changes
}
```

### New ColivaraIndex Model
```
model ColivaraIndex {
  id                    String    @id @default(cuid())
  documentId            String
  chunkId               String?   // Colivara's chunk identifier
  content               String    // Extracted content from vision processing
  embeddings            Json      // Vector embeddings for semantic search
  pageNumbers           Int[]     // Page numbers this content appears on
  documentSection       String?   // Section title if available
  confidenceScore       Float?    // Confidence score from Colivara processing
  createdAt             DateTime  @default(now())
  document              Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  @@map("colivara_indexes")
}
```

## API Specifications

### Colivara Service Configuration
- API Endpoint: `https://api.colivara.com/v1`
- Authentication: Bearer token using API key
- Rate Limits: To be determined based on plan

### Required API Endpoints

1. **Document Upload & Processing**
   - Method: `POST /documents`
   - Purpose: Upload document to Colivara for processing
   - Request: Document URL and metadata
   - Response: Processing job ID and status

2. **Document Status Check**
   - Method: `GET /documents/{documentId}`
   - Purpose: Check processing status of a document
   - Response: Status and metadata

3. **Semantic Search**
   - Method: `POST /search`
   - Purpose: Perform semantic search using vision-processed content
   - Request: Search query
   - Response: Ranked results with context

## Service Layer Design

### Colivara Service Class
```typescript
class ColivaraService {
  async uploadDocument(fileUrl: string, metadata: DocumentMetadata): Promise<ColivaraDocument>
  async checkProcessingStatus(documentId: string): Promise<ProcessingStatus>
  async waitForProcessing(documentId: string, maxWaitTime: number): Promise<boolean>
  async performSemanticSearch(query: string, filters?: SearchFilters): Promise<SearchResults>
  async extractDocumentMetadata(fileUrl: string): Promise<DocumentMetadata>
  async deleteDocument(documentId: string): Promise<boolean>
}
```

### Integration Points

1. **Document Upload Process**
   - After successful file upload to Azure Storage
   - Trigger Colivara processing asynchronously
   - Update document processing status

2. **Search Enhancement**
   - Replace basic text search with semantic search
   - Maintain fallback to database search
   - Combine results from both systems

3. **Document Retrieval**
   - Add Colivara-specific metadata to document responses
   - Provide enhanced content snippets

## Processing Workflow

### New Document Upload
1. User uploads document through existing UI
2. Document saved to Azure Storage (existing)
3. Document record created in database (existing)
4. Colivara processing triggered asynchronously
5. Processing status set to "PENDING"
6. Background job processes document with Colivara
7. On completion, update document with Colivara metadata
8. Index document content in ColivaraIndex table

### Existing Document Processing
1. Run migration script to process all existing documents
2. Queue documents for Colivara processing
3. Update records as processing completes

## Search Enhancement

### Current Search Limitations
- Only searches title, description, and tags
- No content-based search
- No semantic understanding
- No visual content recognition

### Enhanced Search Capabilities
- Full content search using vision processing
- Semantic understanding of queries
- Visual element recognition
- Table and image understanding
- Context-aware results

## Error Handling and Fallbacks

### Processing Failures
- If Colivara processing fails, maintain basic search functionality
- Log errors for monitoring
- Retry mechanism for failed processing

### API Limitations
- Rate limiting handling
- Timeout management
- Graceful degradation when API unavailable

### Data Consistency
- Maintain document checksums to detect changes
- Handle document updates and re-processing
- Synchronize processing status

## Migration Strategy

### Phase 1: Infrastructure
- Add new database fields
- Create Colivara service
- Implement basic processing workflow

### Phase 2: Processing
- Process existing documents
- Update search functionality
- Maintain backward compatibility

### Phase 3: Enhancement
- Optimize search performance
- Add advanced features
- Monitor and improve

## Security Considerations

### API Key Management
- Store Colivara API key in environment variables
- Use secure connection to Colivara API
- Monitor API usage

### Data Privacy
- Ensure document privacy during processing
- Comply with data protection regulations
- Secure document URLs

## Performance Optimization

### Caching Strategy
- Cache processed document results
- Cache frequent search queries
- Implement result pagination

### Background Processing
- Use queue system for document processing
- Implement retry logic for failed jobs
- Monitor processing queue

## Monitoring and Analytics

### Key Metrics
- Processing success/failure rates
- Search performance improvements
- API usage and costs
- User engagement with enhanced search

## Testing Strategy

### Unit Tests
- Colivara service methods
- Search result processing
- Error handling scenarios

### Integration Tests
- End-to-end document processing
- Search functionality
- API integration

### Performance Tests
- Search response times
- Processing throughput
- System load under various conditions

## Deployment Considerations

### Environment Variables
- COLIVARA_API_KEY
- COLIVARA_API_ENDPOINT
- COLIVARA_PROCESSING_TIMEOUT

### Resource Requirements
- Additional storage for embeddings
- Processing queue system
- Monitoring tools

## Rollout Plan

### Staged Rollout
1. Deploy to staging environment
2. Test with subset of documents
3. Gradual rollout to production
4. Monitor performance and user feedback

### Rollback Plan
- Ability to disable Colivara integration
- Revert to original search functionality
- Preserve data integrity during rollback