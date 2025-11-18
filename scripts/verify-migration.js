require('dotenv').config();

const { Client } = require('pg');

async function verifyMigration() {
  console.log('Verifying database migration...');

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

    // Check if colivara fields exist in documents table
    console.log('\n1. Checking if Colivara fields exist in documents table...');
    const colivaraFieldsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'documents' 
      AND column_name IN ('colivaraDocumentId', 'colivaraEmbeddings', 'colivaraMetadata', 
                          'colivaraProcessingStatus', 'colivaraProcessedAt', 'colivaraChecksum')
      ORDER BY column_name;
    `;

    const colivaraFieldsResult = await client.query(colivaraFieldsQuery);
    
    if (colivaraFieldsResult.rows.length === 6) {
      console.log('✅ All 6 Colivara fields exist in documents table:');
      colivaraFieldsResult.rows.forEach(field => {
        console.log(`   - ${field.column_name} (${field.data_type})`);
      });
    } else {
      console.log('❌ Missing Colivara fields in documents table');
      console.log(`   Expected: 6 fields, Found: ${colivaraFieldsResult.rows.length} fields`);
    }

    // Check if colivara_indexes table exists
    console.log('\n2. Checking if colivara_indexes table exists...');
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'colivara_indexes'
      ) AS table_exists;
    `;

    const tableExistsResult = await client.query(tableExistsQuery);
    const tableExists = tableExistsResult.rows[0].table_exists;

    if (tableExists) {
      console.log('✅ colivara_indexes table exists');
      
      // Check structure of colivara_indexes table
      const indexesTableStructureQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'colivara_indexes'
        ORDER BY ordinal_position;
      `;
      
      const indexesStructure = await client.query(indexesTableStructureQuery);
      console.log('✅ colivara_indexes table structure:');
      indexesStructure.rows.forEach(column => {
        console.log(`   - ${column.column_name} (${column.data_type})`);
      });
    } else {
      console.log('❌ colivara_indexes table does not exist');
    }

    // Check if foreign key constraint exists
    console.log('\n3. Checking if foreign key constraint exists...');
    const fkConstraintQuery = `
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'colivara_indexes'
      AND kcu.column_name = 'documentId';
    `;

    const fkResult = await client.query(fkConstraintQuery);
    
    if (fkResult.rows.length > 0) {
      console.log('✅ Foreign key constraint exists:');
      console.log(`   - ${fkResult.rows[0].table_name}.${fkResult.rows[0].column_name} -> ${fkResult.rows[0].foreign_table_name}.${fkResult.rows[0].foreign_column_name}`);
    } else {
      console.log('❌ Foreign key constraint does not exist');
    }

    // Check if index exists
    console.log('\n4. Checking if index exists...');
    const indexQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'colivara_indexes' 
      AND indexname = 'colivara_indexes_documentId_idx';
    `;

    const indexResult = await client.query(indexQuery);
    
    if (indexResult.rows.length > 0) {
      console.log('✅ Index exists: colivara_indexes_documentId_idx');
    } else {
      console.log('❌ Index does not exist: colivara_indexes_documentId_idx');
    }

    console.log('\n🎉 Migration verification completed!');
    
    const allChecksPassed = 
      colivaraFieldsResult.rows.length === 6 && 
      tableExists && 
      fkResult.rows.length > 0 && 
      indexResult.rows.length > 0;

    if (allChecksPassed) {
      console.log('✅ All migration checks passed! Database is ready for Colivara integration.');
    } else {
      console.log('❌ Some migration checks failed. Please review the output above.');
    }

  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the verification
verifyMigration()
 .then(() => {
    console.log('\nVerification process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nVerification process failed:', error);
    process.exit(1);
  });