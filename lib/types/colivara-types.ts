// Temporary type definitions for Colivara integration
// These will be replaced once Prisma client is properly generated

export interface ColivaraDocument {
  id: string;
  documentId: string;
  colivaraDocumentId: string | null;
  colivaraEmbeddings: any | null; // JSON type
 colivaraMetadata: any | null; // JSON type
 colivaraProcessingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null;
  colivaraProcessedAt: Date | null;
  colivaraChecksum: string | null;
}

export interface ColivaraIndex {
  id: string;
  documentId: string;
  chunkId: string | null;
  content: string;
  embeddings: any; // JSON type
  pageNumbers: number[];
  documentSection: string | null;
  confidenceScore: number | null;
  createdAt: Date;
}