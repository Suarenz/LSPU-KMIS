import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script fixes the RLS policy to allow faculty users to view admin-uploaded documents
async function fixDocumentVisibilityRLS() {
  console.log('Fixing document visibility RLS policy to allow faculty users to view admin-uploaded documents...');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
 );

  console.log('Supabase admin client created');

  try {
    // First, drop the existing document view policy
    console.log('Dropping existing document view policy...');
    const { error: dropError } = await supabase.rpc('execute_sql', { 
      sql: 'DROP POLICY IF EXISTS "Users can view documents they have permissions for" ON documents;' 
    });
    
    if (dropError) {
      console.log('Could not drop existing policy via RPC, attempting direct SQL...');
      // If RPC fails, we need to run the SQL directly in Supabase SQL Editor
      console.log('Please run the following SQL command directly in your Supabase SQL Editor:');
      console.log(`
        DROP POLICY IF EXISTS "Users can view documents they have permissions for" ON documents;
        
        CREATE POLICY "Users can view documents they have permissions for" ON documents
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM document_permissions
              WHERE document_permissions."documentId" = documents.id
              AND document_permissions."userId"::text = (SELECT auth.uid())::text
              AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
            )
            OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
            OR (auth.jwt() ->> 'role' = 'ADMIN')
            OR (auth.jwt() ->> 'role' = 'FACULTY')
          );
      `);
      return;
    } else {
      console.log('Successfully dropped existing policy');
    }

    // Create the corrected policy that allows faculty users to see all documents
    console.log('Creating corrected policy...');
    const { error: createError } = await supabase.rpc('execute_sql', { 
      sql: `CREATE POLICY "Users can view documents they have permissions for" ON documents
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM document_permissions
                WHERE document_permissions."documentId" = documents.id
                AND document_permissions."userId"::text = (SELECT auth.uid())::text
                AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
              )
              OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
              OR (auth.jwt() ->> 'role' = 'ADMIN')
              OR (auth.jwt() ->> 'role' = 'FACULTY')
            );` 
    });

    if (createError) {
      console.log('Could not create policy via RPC, attempting direct SQL...');
      console.log('Please run the following SQL command directly in your Supabase SQL Editor:');
      console.log(`
        CREATE POLICY "Users can view documents they have permissions for" ON documents
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM document_permissions
              WHERE document_permissions."documentId" = documents.id
              AND document_permissions."userId"::text = (SELECT auth.uid())::text
              AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
            )
            OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
            OR (auth.jwt() ->> 'role' = 'ADMIN')
            OR (auth.jwt() ->> 'role' = 'FACULTY')
          );
      `);
    } else {
      console.log('Successfully created corrected policy!');
      console.log('Faculty users can now view documents uploaded by admin users.');
    }
 } catch (error) {
    console.error('Error fixing document visibility RLS policy:', error);
    console.log('Please run the following SQL command directly in your Supabase SQL Editor:');
    console.log(`
      DROP POLICY IF EXISTS "Users can view documents they have permissions for" ON documents;
      
      CREATE POLICY "Users can view documents they have permissions for" ON documents
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM document_permissions
            WHERE document_permissions."documentId" = documents.id
            AND document_permissions."userId"::text = (SELECT auth.uid())::text
            AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
          )
          OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
          OR (auth.jwt() ->> 'role' = 'ADMIN')
          OR (auth.jwt() ->> 'role' = 'FACULTY')
        );
    `);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  fixDocumentVisibilityRLS().catch(console.error);
}

export default fixDocumentVisibilityRLS;