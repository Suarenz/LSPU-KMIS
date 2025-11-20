# Super Mapper Implementation

## Overview
The Super Mapper is a utility designed to handle document field mapping across different data sources. It addresses the need to look for document data under various possible field names, ensuring that regardless of whether a field is called `document_name`, `originalName`, `fileName`, or some other variation, the application will be able to find and use it.

## Problem Statement
In the LSPU KMIS system, document data can come from multiple sources (traditional database, Colivara AI service, file metadata, etc.) which may use different field names for the same concept. This creates inconsistency in accessing document properties and can lead to missing data when fields don't match expected names.

## Solution
The Super Mapper provides a comprehensive solution by:

1. Defining possible field name variations for common document properties
2. Providing utility functions to extract values using multiple possible names
3. Creating standardized document objects from various data sources
4. Handling nested properties and metadata objects

## Implementation Details

### Core Components

#### 1. DocumentFieldMapping Interface
Defines the standard field names that the Super Mapper works with, including common variations:

- Title fields: `title`, `document_title`, `originalName`, `name`, `fileName`, `file_name`, `documentName`
- Description fields: `description`, `content`, `text`, `summary`, `desc`, `body`
- File name fields: `fileName`, `file_name`, `originalFileName`, `original_file_name`, `filename`
- File URL fields: `fileUrl`, `file_url`, `url`, `documentUrl`, `document_url`, `source`
- ID fields: `id`, `documentId`, `document_id`, `docId`, `doc_id`, `_id`
- And more for category, tags, uploader, dates, file type, and size

#### 2. extractValue Function
A generic utility that tries multiple possible field names for a given property and returns the first value found:

```typescript
function extractValue<T>(obj: any, possibleFieldNames: string[]): T | undefined
```

#### 3. SuperMapper Class
The main class providing the mapping functionality with these methods:

- `mapDocumentData(rawData: any)`: Maps raw data to a consistent format
- `getFieldValue(obj: any, fieldPath: string | string[])`: Gets a specific field trying multiple possible names
- `createStandardDocument(rawData: any)`: Creates a standardized document object

### Usage Examples

#### Basic Usage
```typescript
import SuperMapper from '@/lib/utils/super-mapper';

// Raw data from various sources
const rawData = {
  originalName: 'My Document.pdf',
  content: 'This is the document content...',
  uploader: 'John Doe',
  uploadDate: '2023-01-01'
};

// Create a standardized document
const standardDoc = SuperMapper.createStandardDocument(rawData);
// Result: { id: undefined, title: 'My Document.pdf', description: 'This is the document content...', ... }
```

#### Getting Specific Field Values
```typescript
// Get a title field regardless of what it's called
const title = SuperMapper.getFieldValue(rawData, 'title');
// Tries: 'title', 'document_title', 'originalName', 'name', 'fileName', etc.

// Get a nested property
const metadataTitle = SuperMapper.getFieldValue(rawData, 'metadata.originalName');
// Also tries variations like 'meta.originalName', 'data.originalName', etc.
```

## Integration Points

The Super Mapper should be integrated into:

1. **Search API** (`app/api/search/route.ts`): To handle results from different search sources
2. **Document Services** (`lib/services/document-service.ts`, `lib/services/enhanced-document-service.ts`): To standardize document data processing
3. **Colivara Service** (`lib/services/colivara-service.ts`): To handle API response variations
4. **Frontend Components** (`app/search/page.tsx`): To display document data consistently

## Benefits

1. **Robustness**: Applications can handle data from various sources without breaking when field names differ
2. **Maintainability**: Centralized field mapping logic makes it easier to add new field variations
3. **Flexibility**: Easy to extend with new field mappings as needed
4. **Backward Compatibility**: Existing code continues to work while supporting new field naming conventions

## Future Enhancements

1. Configuration-based field mappings for different data sources
2. Type-safe mapping with better TypeScript support
3. Performance optimizations for large datasets
4. Field mapping statistics and analytics