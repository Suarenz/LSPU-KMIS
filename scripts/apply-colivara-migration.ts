/**
 * Script to manually apply Colivara database migration
 * This script should be run after the Prisma migration files are created
 */

import { Client } from 'pg';

async function applyColivaraMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Add Colivara fields to documents table
    console.log('Adding Colivara fields to documents table...');
    await client.query(`
      ALTER TABLE "documents" 
      ADD COLUMN IF NOT EXISTS "colivaraDocumentId" TEXT,
      ADD COLUMN IF NOT EXISTS "colivaraEmbeddings" JSONB,
      ADD COLUMN IF NOT EXISTS "colivaraMetadata" JSONB,
      ADD COLUMN IF NOT EXISTS "colivaraProcessingStatus" TEXT DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS "colivaraProcessedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "colivaraChecksum" TEXT;
    `);

    // Create colivara_indexes table
    console.log('Creating colivara_indexes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "colivara_indexes" (
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
    `);

    // Add foreign key constraint
    console.log('Adding foreign key constraint...');
    await client.query(`
      ALTER TABLE "colivara_indexes" 
      ADD CONSTRAINT IF NOT EXISTS "colivara_indexes_documentId_fkey" 
      FOREIGN KEY ("documentId") REFERENCES "documents"("id") 
      ON DELETE CASCADE 
      ON UPDATE CASCADE;
    `);

    // Create index for better performance
    console.log('Creating index for better performance...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "colivara_indexes_documentId_idx" ON "colivara_indexes"("documentId");
    `);

    console.log('Colivara migration applied successfully!');
    console.log('Next steps:');
    console.log('1. Run `npx prisma generate` to regenerate the Prisma client');
    console.log('2. Update document service to properly use Colivara fields instead of type assertions');
    console.log('3. Test the Colivara service initialization');
    console.log('4. Run the validation script to confirm all components work');
  } catch (error) {
    console.error('Error applying Colivara migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  applyColivaraMigration()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default applyColivaraMigration;