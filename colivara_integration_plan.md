olivara_integration_plan.md</path>
<content lines="1-12">
# Colivara Integration Analysis and Implementation Plan

## Current Status Analysis

Based on my analysis of the codebase, the Colivara search function is implemented but has several critical issues that prevent it from working properly:

### 1. Missing Environment Variables
The `.env` file is missing the required Colivara API configuration:
- `COLIVARA_API_KEY` - API key for Colivara service
- `COLIVARA_API_ENDPOINT` - Base URL for Colivara API
- `COLIVARA_PROCESSING_TIMEOUT` - Timeout for document processing

### 2. Missing Database Migration
The Prisma schema includes Colivara fields, but there's no corresponding database migration to add these fields to the actual database. The required fields are:
- `colivaraDocumentId`: Unique identifier from Colivara
- `colivaraEmbeddings`: Document embeddings for semantic search
- `colivaraMetadata`: Additional metadata extracted by Colivara
- `colivaraProcessingStatus`: Processing status (PENDING, PROCESSING, COMPLETED, FAILED)
- `colivaraProcessedAt`: Timestamp when processing was completed
- `colivaraChecksum`: Checksum to track document changes

And the `ColivaraIndex` model for storing processed content chunks.

### 3. Prisma Client Issues
The Prisma client may not have been regenerated after adding Colivara fields to the schema, which would cause runtime errors when trying to access these fields.

## Required Fixes

### 1. Add Environment Variables
Add the following to the `.env` file:
```
# Colivara API Configuration
COLIVARA_API_KEY="your-colivara-api-key-here"
COLIVARA_API_ENDPOINT="https://api.colivara.com/v1"
COLIVARA_PROCESSING_TIMEOUT=300000 # 5 minutes in milliseconds
```

### 2. Create Database Migration
Create a new migration to add the Colivara fields to the database:

```sql
-- Add Colivara fields to documents table
ALTER TABLE "documents" 
ADD COLUMN "colivaraDocumentId" TEXT,
ADD COLUMN "colivaraEmbeddings" JSONB,
ADD COLUMN "colivaraMetadata" JSONB,
ADD COLUMN "colivaraProcessingStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN "colivaraProcessedAt" TIMESTAMP(3),
ADD COLUMN "colivaraChecksum" TEXT;

-- Create colivara_indexes table
CREATE TABLE "colivara_indexes" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkId" TEXT,
    "content" TEXT NOT NULL,
    "embeddings" JSONB NOT NULL,
    "pageNumbers" INTEGER[],
    "documentSection" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colivara_indexes_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "colivara_indexes" 
ADD CONSTRAINT "colivara_indexes_documentId_fkey" 
FOREIGN KEY ("documentId") REFERENCES "documents"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Create index for better performance
CREATE INDEX "colivara_indexes_documentId_idx" ON "colivara_indexes"("documentId");
```

### 3. Regenerate Prisma Client
Run the following commands to regenerate the Prisma client:
```bash
npx prisma generate
npx prisma db push
```

### 4. Update Validation Script
The validation script should properly check all Colivara components and their dependencies.

## Implementation Steps

1. Add environment variables to `.env`
2. Create and run the database migration
3. Regenerate the Prisma client
4. Test the Colivara service initialization
5. Test the search functionality
6. Run the validation script to confirm all components work

## Expected Outcome

After implementing these fixes, the Colivara search functionality should:
- Properly initialize the Colivara service with valid API credentials
- Store document processing status in the database
- Perform semantic and hybrid searches
- Display processing status in the UI
- Process documents with Colivara's vision-based capabilities

## Additional Implementation Notes

### Database Migration File
Create a new file at `prisma/migrations/20251117131900_add_colivara_fields/migration.sql` with the following content:

```sql
-- Add Colivara fields to documents table
ALTER TABLE "documents" 
ADD COLUMN "colivaraDocumentId" TEXT,
ADD COLUMN "colivaraEmbeddings" JSONB,
ADD COLUMN "colivaraMetadata" JSONB,
ADD COLUMN "colivaraProcessingStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN "colivaraProcessedAt" TIMESTAMP(3),
ADD COLUMN "colivaraChecksum" TEXT;

-- Create colivara_indexes table
CREATE TABLE "colivara_indexes" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkId" TEXT,
    "content" TEXT NOT NULL,
    "embeddings" JSONB NOT NULL,
    "pageNumbers" INTEGER[],
    "documentSection" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colivara_indexes_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "colivara_indexes" 
ADD CONSTRAINT "colivara_indexes_documentId_fkey" 
FOREIGN KEY ("documentId") REFERENCES "documents"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Create index for better performance
CREATE INDEX "colivara_indexes_documentId_idx" ON "colivara_indexes"("documentId");