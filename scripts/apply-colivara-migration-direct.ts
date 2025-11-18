/**
 * Script to manually apply Colivara database migration using the PostgreSQL client directly
 * This script should be run when Prisma CLI is not working properly
 */

import { Client } from 'pg';

async function applyColivaraMigrationDirect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check if colivara fields already exist in documents table
    const checkDocumentsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'documents'
      AND column_name LIKE 'colivara%';
    `;
    
    const existingColumns = await client.query(checkDocumentsQuery);
    console.log(`Found ${existingColumns.rows.length} existing colivara columns in documents table`);

    if (existingColumns.rows.length === 0) {
      // Add Colivara fields to documents table
      console.log('Adding Colivara fields to documents table...');
      await client.query(`
        ALTER TABLE "documents" 
        ADD COLUMN "colivaraDocumentId" TEXT,
        ADD COLUMN "colivaraEmbeddings" JSONB,
        ADD COLUMN "colivaraMetadata" JSONB,
        ADD COLUMN "colivaraProcessingStatus" TEXT DEFAULT 'PENDING',
        ADD COLUMN "colivaraProcessedAt" TIMESTAMP(3),
        ADD COLUMN "colivaraChecksum" TEXT;
      `);
      console.log('✅ Colivara fields added to documents table');
    } else {
      console.log('⚠️ Colivara fields already exist in documents table');
    }

    // Check if colivara_indexes table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'colivara_indexes'
      );
    `;
    
    const tableExistsResult = await client.query(checkTableQuery);
    const tableExists = tableExistsResult.rows[0].exists;
    
    if (!tableExists) {
      // Create colivara_indexes table
      console.log('Creating colivara_indexes table...');
      await client.query(`
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
      `);
      console.log('✅ colivara_indexes table created');
    } else {
      console.log('⚠️ colivara_indexes table already exists');
    }

    // Check if foreign key constraint exists
    const checkFkQuery = `
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'colivara_indexes'
      AND constraint_name = 'colivara_indexes_documentId_fkey';
    `;
    
    const fkResult = await client.query(checkFkQuery);
    
    if (fkResult.rows.length === 0) {
      // Add foreign key constraint
      console.log('Adding foreign key constraint...');
      await client.query(`
        ALTER TABLE "colivara_indexes" 
        ADD CONSTRAINT "colivara_indexes_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "documents"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
      `);
      console.log('✅ Foreign key constraint added');
    } else {
      console.log('⚠️ Foreign key constraint already exists');
    }

    // Check if index exists
    const checkIndexQuery = `
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'colivara_indexes'
      AND indexname = 'colivara_indexes_documentId_idx';
    `;
    
    const indexResult = await client.query(checkIndexQuery);
    
    if (indexResult.rows.length === 0) {
      // Create index for better performance
      console.log('Creating index for better performance...');
      await client.query(`
        CREATE INDEX "colivara_indexes_documentId_idx" ON "colivara_indexes"("documentId");
      `);
      console.log('✅ Index created for better performance');
    } else {
      console.log('⚠️ Index already exists');
    }

    console.log('\n✅ Colivara migration applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Run `npx prisma generate` to regenerate the Prisma client (when npm is working)');
    console.log('2. Update document service to properly use Colivara fields instead of type assertions');
    console.log('3. Test the Colivara service initialization');
    console.log('4. Run the validation script to confirm all components work');
  } catch (error) {
    console.error('❌ Error applying Colivara migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  applyColivaraMigrationDirect()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default applyColivaraMigrationDirect;