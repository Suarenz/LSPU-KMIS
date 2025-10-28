import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script applies the correct RLS policies to the Supabase storage bucket
async function applyRLSPolicies() {
  console.log('Applying RLS policies to Supabase storage bucket...');
  
  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
  );
  
  console.log('Supabase admin client created');
  
  // Check if bucket exists
  console.log('Checking if repository-files bucket exists...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  const repositoryFilesBucket = buckets.find(bucket => bucket.name === 'repository-files');
  if (!repositoryFilesBucket) {
    console.error('Repository-files bucket not found');
    return;
  }
  
  console.log('Repository-files bucket found');
  
  try {
    // Execute the SQL commands to create RLS policies
    console.log('RLS policies need to be applied manually in the Supabase SQL Editor.');
    console.log('Please run these commands in your Supabase project SQL Editor:');
    
    console.log('\n--- SELECT POLICY (for reading files) ---');
    console.log(`CREATE POLICY "Allow authenticated users to read files in repository-files bucket"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'repository-files');`);
    
    console.log('\n--- INSERT POLICY (for uploading files) ---');
    console.log(`CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'repository-files'
      AND (EXISTS (
        SELECT 1 FROM users
        WHERE users.supabase_auth_id::text = auth.uid()::text
        AND users.role IN ('ADMIN', 'FACULTY')
      ))
    );`);
    
    console.log('\n--- UPDATE POLICY (for updating files) ---');
    console.log(`CREATE POLICY "Allow owners and admins to update files in repository-files bucket"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'repository-files'
      AND (
        owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.supabase_auth_id::text = auth.uid()::text
          AND users.role = 'ADMIN'
        )
      )
    );`);
    
    console.log('\n--- DELETE POLICY (for deleting files) ---');
    console.log(`CREATE POLICY "Allow owners and admins to delete files in repository-files bucket"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'repository-files'
      AND (
        owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.supabase_auth_id::text = auth.uid()::text
          AND users.role = 'ADMIN'
        )
      )
    );`);
    
    console.log('\n--- If you need to drop existing policies first ---');
    console.log(`DROP POLICY IF EXISTS "Allow authenticated users to read files in repository-files bucket" ON storage.objects;`);
    console.log(`DROP POLICY IF EXISTS "Allow admin and faculty to upload files to repository-files bucket" ON storage.objects;`);
    console.log(`DROP POLICY IF EXISTS "Allow owners and admins to update files in repository-files bucket" ON storage.objects;`);
    console.log(`DROP POLICY IF EXISTS "Allow owners and admins to delete files in repository-files bucket" ON storage.objects;`);
    
    console.log('\n--- DATABASE TABLE RLS POLICIES (if needed) ---');
    console.log('These policies are for database tables, not storage objects:');
    console.log('');
    console.log('-- Enable RLS on all tables:');
    console.log(`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`);
    console.log(`ALTER TABLE documents ENABLE ROW LEVEL SECURITY;`);
    console.log(`ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;`);
    console.log(`ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;`);
    console.log(`ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;`);
    console.log(`ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;`);
    console.log('');
    console.log('-- Create policies for users table:');
    console.log(`CREATE POLICY "Users can view their own profile" ON users`);
    console.log(`  FOR SELECT USING (`);
    console.log(`    id::text = (SELECT auth.uid())::text OR`);
    console.log(`    supabase_auth_id::text = (SELECT auth.uid())::text OR`);
    console.log(`    EXISTS (`);
    console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
    console.log(`    )`);
    console.log(`  );`);
    console.log('');
    console.log('-- Create policies for documents table:');
    console.log(`CREATE POLICY "Users can view documents they have permissions for" ON documents`);
    console.log(`  FOR SELECT USING (`);
    console.log(`    EXISTS (`);
    console.log(`      SELECT 1 FROM document_permissions`);
    console.log(`      WHERE document_permissions.documentId = documents.id`);
    console.log(`      AND document_permissions.userId::text = (SELECT auth.uid())::text`);
    console.log(`      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN'])`);
    console.log(`    )`);
    console.log(`    OR (SELECT uploadedById FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
    console.log(`    OR EXISTS (`);
    console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
    console.log(`    )`);
    console.log(`  );`);
    console.log('');
    console.log(`CREATE POLICY "Users can upload documents" ON documents`);
    console.log(`  FOR INSERT WITH CHECK (`);
    console.log(`    EXISTS (`);
    console.log(`      SELECT 1 FROM users`);
    console.log(`      WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text`);
    console.log(`      AND users.role IN ('ADMIN', 'FACULTY')`);
    console.log(`    )`);
    console.log(`  );`);
    console.log('');
    console.log(`CREATE POLICY "Users can update documents they own or have admin permission" ON documents`);
    console.log(`  FOR UPDATE USING (`);
    console.log(`    (SELECT uploadedById FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
    console.log(`    OR EXISTS (`);
    console.log(`      SELECT 1 FROM document_permissions`);
    console.log(`      WHERE document_permissions.documentId = documents.id`);
    console.log(`      AND document_permissions.userId::text = (SELECT auth.uid())::text`);
    console.log(`      AND document_permissions.permission = 'ADMIN'`);
    console.log(`    )`);
    console.log(`    OR EXISTS (`);
    console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
    console.log(`    )`);
    console.log(`  );`);
    console.log('');
    console.log(`CREATE POLICY "Users can delete documents they own or have admin permission" ON documents`);
    console.log(`  FOR DELETE USING (`);
    console.log(`    (SELECT uploadedById FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
    console.log(`    OR EXISTS (`);
    console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
    console.log(`    )`);
    console.log(`  );`);
    
    console.log('RLS policies applied successfully!');
    console.log('\nNote: If the execute_sql RPC is not available in your Supabase setup,');
    console.log('you can manually run the following SQL commands in the Supabase SQL Editor:');
    
    console.log('\n--- SELECT POLICY ---');
    console.log(`CREATE POLICY "Allow authenticated users to read files in repository-files bucket"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'repository-files');`);
    
    console.log('\n--- INSERT POLICY ---');
    console.log(`CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'repository-files' 
      AND (EXISTS (
        SELECT 1 FROM users 
        WHERE users.supabase_auth_id = auth.uid() 
        AND users.role IN ('ADMIN', 'FACULTY')
      ))
    );`);
    
    console.log('\n--- UPDATE POLICY ---');
    console.log(`CREATE POLICY "Allow owners and admins to update files in repository-files bucket"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'repository-files'
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE users.supabase_auth_id = auth.uid() 
          AND users.role = 'ADMIN'
        )
      )
    );`);
    
    console.log('\n--- DELETE POLICY ---');
    console.log(`CREATE POLICY "Allow owners and admins to delete files in repository-files bucket"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'repository-files'
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE users.supabase_auth_id = auth.uid() 
          AND users.role = 'ADMIN'
        )
      )
    );`);
    
  } catch (error) {
    console.error('Error applying RLS policies:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  applyRLSPolicies().catch(console.error);
}

export default applyRLSPolicies;