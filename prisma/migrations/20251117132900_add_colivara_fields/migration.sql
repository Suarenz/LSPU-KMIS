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