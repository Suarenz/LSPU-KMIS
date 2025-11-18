require('dotenv').config();

const { Client } = require('pg');

async function runMigration() {
  console.log('Applying database migration using raw SQL...');

  // Create a PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Azure Database
    }
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database successfully.');

    // Check if colivara fields already exist in documents table
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'documents' 
      AND column_name IN ('colivaraDocumentId', 'colivaraEmbeddings', 'colivaraMetadata', 
                          'colivaraProcessingStatus', 'colivaraProcessedAt', 'colivaraChecksum')
    `;

    const existingColumns = await client.query(checkColumnsQuery);
    
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
        WHERE table_name = 'colivara_indexes'
      ) AS table_exists;
    `;

    const tableExistsResult = await client.query(checkTableQuery);
    const tableExists = tableExistsResult.rows[0].table_exists;

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

      // Create index for better performance
      console.log('Creating index for better performance...');
      await client.query(`
        CREATE INDEX "colivara_indexes_documentId_idx" ON "colivara_indexes"("documentId");
      `);
      console.log('✅ Index created');
    } else {
      console.log('⚠️ colivara_indexes table already exists');
    }

    console.log('\n🎉 Database migration completed successfully!');
    console.log('The following changes have been applied:');
    console.log('1. Added Colivara fields to the documents table');
    console.log('2. Created the colivara_indexes table');
    console.log('3. Added foreign key constraint between documents and colivara_indexes');
    console.log('4. Created an index for better performance');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the migration
runMigration()
 .then(() => {
    console.log('\nMigration process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration process failed:', error);
    process.exit(1);
  });