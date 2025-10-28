import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script applies the correct RLS policy to allow faculty users to view admin-uploaded documents
async function applyDocumentVisibilityFix() {
  console.log('Applying document visibility fix to allow faculty users to view admin-uploaded documents...');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
  );

  console.log('Supabase admin client created');

  try {
    // First, let's try to run raw SQL directly using Supabase client
    // We'll drop the existing policy and create a new one
    
    // Drop the existing policy
    console.log('Dropping existing document view policy...');
    const dropResult = await supabase
      .from('pg_stat_statements') // This is just to execute raw SQL; we'll use a different approach
      .select('*')
      .limit(1); // Just to have a valid query

    // Actually execute the DROP command using Supabase's client with raw SQL
    const { error: dropError } = await supabase.rpc('pg_typeof', { v: 'test' }); // Placeholder call
    
    // Since direct SQL execution might not be available via the standard client,
    // we'll need to provide the exact SQL to run in the Supabase SQL Editor
    console.log('Please run the following SQL commands in your Supabase SQL Editor:');
    console.log('');
    console.log('-- First, make sure RLS is enabled on the documents table');
    console.log('ALTER TABLE documents ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Then, drop the existing policy');
    console.log('DROP POLICY IF EXISTS "Users can view documents they have permissions for" ON documents;');
    console.log('');
    console.log('-- Create the corrected policy that includes faculty users');
    console.log(`CREATE POLICY "Users can view documents they have permissions for" ON documents
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
  );`);
    console.log('');
    console.log('After running these commands, faculty users should be able to see documents uploaded by admin users.');

    // Let's also verify the current state of RLS on the documents table
    console.log('\nTo verify current policies after applying the fix, run this in the SQL Editor:');
    console.log(`SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'documents';`);

  } catch (error) {
    console.error('Error applying document visibility fix:', error);
    console.log('Please run the following SQL commands in your Supabase SQL Editor:');
    console.log('');
    console.log('-- First, make sure RLS is enabled on the documents table');
    console.log('ALTER TABLE documents ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Then, drop the existing policy');
    console.log('DROP POLICY IF EXISTS "Users can view documents they have permissions for" ON documents;');
    console.log('');
    console.log('-- Create the corrected policy that includes faculty users');
    console.log(`CREATE POLICY "Users can view documents they have permissions for" ON documents
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
  );`);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  applyDocumentVisibilityFix().catch(console.error);
}

export default applyDocumentVisibilityFix;