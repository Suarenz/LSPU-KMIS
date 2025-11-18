import { Document } from '@/lib/api/types';

// Extended document type that includes Colivara fields
export interface DocumentWithColivara extends Document {
  colivaraDocumentId?: string;
  colivaraEmbeddings?: any; // JSON type
 colivaraMetadata?: any; // JSON type
  colivaraProcessingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  colivaraProcessedAt?: Date;
  colivaraChecksum?: string;
}