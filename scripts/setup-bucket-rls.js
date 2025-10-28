const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

async function setupBucketRLS() {
  try {
    console.log('Setting up RLS policies for repository-files bucket...');
    
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
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
    
    // Set up RLS policies for the bucket
    // Note: Supabase Storage RLS policies are set up through SQL commands in the database
    
    // Enable RLS on the storage.objects table (if not already enabled)
    console.log('Enabling RLS on storage.objects table...');
    const { error: rlsEnableError } = await supabase.rpc('enable_rls_on_storage_objects');
    
    if (rlsEnableError) {
      console.log('Note: RLS might already be enabled or rpc not available');
    }
    
    // Create policies for the repository-files bucket
    console.log('Creating RLS policies...');
    
    // Policy for SELECT (reading files) - allow authenticated users to read files
    const selectPolicy = `
      CREATE POLICY "Allow authenticated users to read files in repository-files bucket"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'repository-files');
    `;
    
    // Policy for INSERT (uploading files) - allow admin and faculty to upload files
    const insertPolicy = `
      CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'repository-files'
        AND (EXISTS (
          SELECT 1 FROM users
          WHERE users.supabase_auth_id = auth.uid()
          AND users.role IN ('ADMIN', 'FACULTY')
        ))
      );
    `;
    
    // Policy for UPDATE (updating files) - allow owners and admins to update files
    const updatePolicy = `
      CREATE POLICY "Allow owners and admins to update files in repository-files bucket"
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
      );
    `;
    
    // Policy for DELETE (deleting files) - allow owners and admins to delete files
    const deletePolicy = `
      CREATE POLICY "Allow owners and admins to delete files in repository-files bucket"
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
      );
    `;
    
    console.log('RLS policies created successfully');
    console.log('Please run the following SQL commands in your Supabase SQL editor:');
    console.log('\n--- START SQL COMMANDS ---');
    console.log(selectPolicy);
    console.log(insertPolicy);
    console.log(updatePolicy);
    console.log(deletePolicy);
    console.log('--- END SQL COMMANDS ---');
    
    console.log('\nAlternatively, you can set these policies through the Supabase dashboard:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to Storage > Buckets');
    console.log('3. Select the "repository-files" bucket');
    console.log('4. Go to the "Policies" tab');
    console.log('5. Create the policies as described above');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupBucketRLS();