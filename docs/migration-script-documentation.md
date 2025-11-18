# Migration Script for Existing Documents

## Overview
This document outlines the migration script that will process all existing documents in the system with Colivara's vision-based document processing capabilities. The script will ensure that all previously uploaded documents become available with enhanced search functionality.

## Migration Requirements

### 1. Prerequisites
- Valid Colivara API key and endpoint configuration
- Database connectivity
- Azure Storage access for document files
- Sufficient processing time and API quota
- Backup of current database state

### 2. Environment Variables Required
- `COLIVARA_API_KEY`: API key for Colivara service
- `COLIVARA_API_ENDPOINT`: Base URL for Colivara API
- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct database connection string
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Blob Storage connection

### 3. System Resources
- Sufficient API quota for processing all documents
- Adequate memory for processing large batches
- Network bandwidth for API communications
- Storage space for temporary files if needed

## Migration Script Components

### 1. Main Migration Script
```typescript
interface MigrationConfig {
  batchSize: number;           // Number of documents per batch
  concurrency: number;         // Number of concurrent processing jobs
  retryAttempts: number;       // Number of retry attempts for failed processing
  delayBetweenBatches: number; // Delay between batches to respect rate limits
  processLimit?: number;       // Limit for testing purposes
  startFromId?: string;        // Start processing from specific document ID
}

async function migrateExistingDocuments(config: MigrationConfig): Promise<MigrationResult>;
```

### 2. Document Processor
```typescript
interface DocumentProcessor {
  processDocument(documentId: string): Promise<ProcessingResult>;
  validateDocument(document: Document): boolean;
  updateDocumentStatus(documentId: string, status: string): Promise<void>;
  handleProcessingError(documentId: string, error: Error): Promise<void>;
}
```

### 3. Queue Manager
```typescript
interface QueueManager {
  addDocument(documentId: string): void;
  getNextBatch(size: number): string[];
  markComplete(documentId: string): void;
  markFailed(documentId: string, error: Error): void;
  getStats(): QueueStats;
}
```

## Migration Process Flow

### Phase 1: Preparation
1. **Validate Configuration**
   - Check for required environment variables
   - Test Colivara API connectivity
   - Verify database connectivity
   - Validate Azure Storage access

2. **Document Inventory**
   - Query database for all documents
   - Filter documents that need processing (not already processed)
   - Count total documents requiring processing
   - Estimate migration time based on document count

3. **Initialize Processing Queue**
   - Create queue for documents to be processed
   - Set up tracking for processing status
   - Initialize logging and monitoring

### Phase 2: Processing Execution
1. **Batch Processing Loop**
   ```
   While documents remain in queue:
   - Get next batch of documents
   - Process each document concurrently (up to concurrency limit)
   - Update document status in database
   - Log processing results
   - Wait for delay between batches (respect rate limits)
   ```

2. **Document Processing Workflow**
   For each document:
   - Check if document needs processing (status validation)
   - Update document status to "PROCESSING"
   - Upload document to Colivara service
   - Wait for processing completion
   - Retrieve processing results
   - Store results in local database
   - Update document status to "COMPLETED" or "FAILED"

### Phase 3: Validation and Cleanup
1. **Result Validation**
   - Verify that processed documents have valid embeddings
   - Check for completeness of extracted content
   - Validate search functionality with new data

2. **Cleanup Operations**
   - Close database connections
   - Finalize logs
   - Generate migration summary report

## Detailed Implementation

### 1. Main Migration Function
```typescript
async function migrateExistingDocuments(config: MigrationConfig): Promise<MigrationResult> {
  console.log('Starting document migration process...');
  
  // Validate configuration
  await validateConfiguration(config);
  
  // Initialize services
  const colivaraService = new ColivaraService();
  const queueManager = new QueueManager();
  const documentProcessor = new DocumentProcessor(colivaraService);
  
  // Get documents to process
 const documents = await getUnprocessedDocuments(config);
  console.log(`Found ${documents.length} documents to process`);
  
  // Add documents to queue
  documents.forEach(doc => queueManager.addDocument(doc.id));
  
  // Process documents in batches
  let processedCount = 0;
  let failedCount = 0;
  
  while (!queueManager.isEmpty()) {
    const batch = queueManager.getNextBatch(config.batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(docId => 
      processDocumentSafely(docId, documentProcessor, config.retryAttempts)
    );
    
    const results = await Promise.allSettled(batchPromises);
    
    // Update counts and queue status
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        processedCount++;
      } else {
        failedCount++;
      }
    });
    
    console.log(`Processed batch: ${processedCount} successful, ${failedCount} failed`);
    
    // Respect rate limits
    if (config.delayBetweenBatches > 0) {
      await sleep(config.delayBetweenBatches);
    }
    
    // Check if we've reached the limit (for testing)
    if (config.processLimit && processedCount >= config.processLimit) {
      console.log(`Reached process limit of ${config.processLimit}`);
      break;
    }
  }
  
  // Generate final report
 const report = generateMigrationReport(processedCount, failedCount);
  console.log('Migration completed:', report);
  
  return report;
}
```

### 2. Document Processing Function
```typescript
async function processDocumentSafely(
  documentId: string, 
  processor: DocumentProcessor, 
  retryAttempts: number
): Promise<ProcessingResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for document ${documentId}`);
        await sleep(1000 * attempt); // Exponential backoff
      }
      
      const result = await processor.processDocument(documentId);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed for document ${documentId}:`, error);
      
      // Update document status to reflect failure
      if (attempt === retryAttempts) {
        await processor.handleProcessingError(documentId, error as Error);
      }
    }
  }
  
  throw lastError!;
}
```

### 3. Database Query Functions
```typescript
async function getUnprocessedDocuments(config: MigrationConfig): Promise<Document[]> {
  const whereClause: any = {
    OR: [
      { colivaraProcessingStatus: null },
      { colivaraProcessingStatus: 'PENDING' },
      { colivaraProcessingStatus: 'FAILED' }
    ]
  };
  
  // Add startFromId filter if specified
  if (config.startFromId) {
    whereClause.id = { gte: config.startFromId };
  }
  
  const documents = await prisma.document.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      fileUrl: true,
      fileName: true,
      fileType: true,
      fileSize: true
    },
    orderBy: { id: 'asc' },
    take: config.processLimit
  });
  
  return documents;
}
```

## Error Handling and Recovery

### 1. API Rate Limit Handling
- Implement exponential backoff for rate limit errors
- Track API usage and respect limits
- Pause processing when limits are approached
- Resume after appropriate delay

### 2. Network Error Handling
- Retry failed network requests with exponential backoff
- Log network errors for monitoring
- Implement circuit breaker pattern if needed
- Provide option to resume from last processed document

### 3. Document Processing Errors
- Handle unsupported file types gracefully
- Log specific error types for analysis
- Continue processing other documents
- Provide detailed error reports

### 4. Database Error Handling
- Use transactions for status updates
- Handle connection failures gracefully
- Implement retry logic for database operations
- Log database errors for monitoring

## Progress Tracking and Monitoring

### 1. Progress Indicators
- Track total documents processed
- Monitor success and failure rates
- Calculate and display progress percentage
- Estimate remaining time

### 2. Logging
- Log each document processing attempt
- Record success and failure details
- Track API usage and rate limits
- Log performance metrics

### 3. Checkpoint System
- Save progress checkpoints periodically
- Allow resumption from last checkpoint
- Track documents that have been successfully processed
- Handle partial failures gracefully

## Performance Optimization

### 1. Batch Processing
- Process documents in configurable batches
- Respect API rate limits
- Optimize concurrent processing
- Balance throughput with resource usage

### 2. Resource Management
- Monitor memory usage during processing
- Implement streaming for large documents
- Optimize database queries
- Cache frequently accessed data

### 3. Parallel Processing
- Process multiple documents concurrently
- Respect system and API limits
- Monitor system resource usage
- Adjust concurrency based on performance

## Configuration Options

### 1. Basic Configuration
```typescript
const defaultConfig: MigrationConfig = {
  batchSize: 10,              // Process 10 documents per batch
  concurrency: 3,             // Process 3 documents concurrently
  retryAttempts: 3,           // Retry failed processing 3 times
  delayBetweenBatches: 2000,  // 2 second delay between batches
  processLimit: undefined,    // Process all documents by default
  startFromId: undefined      // Start from beginning by default
};
```

### 2. Advanced Configuration
- Custom API timeout settings
- Specific file type filtering
- Custom error handling strategies
- Detailed logging options

## Testing and Validation

### 1. Test Configuration
- Process a small subset of documents first
- Use a test environment before production
- Validate processing results
- Test error handling scenarios

### 2. Validation Checks
- Verify that processed documents have Colivara metadata
- Test search functionality with processed documents
- Validate document content extraction
- Check for data integrity

## Rollback and Recovery

### 1. Rollback Strategy
- Maintain original document status before migration
- Ability to revert processing status if needed
- Preserve original document metadata
- Option to restart from specific checkpoint

### 2. Recovery Options
- Resume from last processed document
- Re-process failed documents
- Skip already processed documents
- Handle interrupted migrations

## Execution Instructions

### 1. Setup Environment
```bash
# Set required environment variables
export COLIVARA_API_KEY="your-api-key"
export COLIVARA_API_ENDPOINT="https://api.colivara.com/v1"
export DATABASE_URL="your-database-url"
export AZURE_STORAGE_CONNECTION_STRING="your-storage-connection-string"
```

### 2. Run Migration Script
```bash
# Install dependencies
npm install

# Run the migration script
npm run migrate-documents

# Or with specific configuration
npm run migrate-documents -- --batch-size 5 --concurrency 2
```

### 3. Command Line Options
- `--batch-size`: Number of documents per batch (default: 10)
- `--concurrency`: Number of concurrent processes (default: 3)
- `--retry-attempts`: Number of retry attempts (default: 3)
- `--delay-between-batches`: Delay in milliseconds (default: 200)
- `--process-limit`: Limit number of documents to process (for testing)
- `--start-from-id`: Start processing from specific document ID
- `--dry-run`: Validate configuration without processing documents

## Monitoring and Reporting

### 1. Real-time Monitoring
- Display processing progress
- Show success and failure rates
- Monitor API usage
- Track processing time per document

### 2. Final Report
- Total documents processed
- Success vs failure statistics
- Processing time summary
- Error summary and details
- Recommendations for optimization

## Post-Migration Tasks

### 1. Verification
- Verify that all documents have been processed
- Test search functionality with various queries
- Validate document content extraction
- Check system performance

### 2. Optimization
- Update database indexes if needed
- Optimize search performance
- Clean up temporary resources
- Update system documentation

This migration script will systematically process all existing documents in the system, enabling the enhanced search functionality for the entire document repository.