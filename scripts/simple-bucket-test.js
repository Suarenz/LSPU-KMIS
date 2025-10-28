const { createServerClient } = require('@supabase/ssr');

// Load environment variables
require('dotenv').config();

async function testBucket() {
  try {
    console.log('Testing Supabase bucket configuration...');
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op for testing
          }
        }
      }
    );
    
    console.log('Supabase client created');
    
    // Try to list all buckets
    console.log('Listing all buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    console.log('Available buckets:', buckets);
    
    // Check if 'repository-files' bucket exists
    const repositoryFilesBucket = buckets.find(bucket => bucket.name === 'repository-files');
    if (repositoryFilesBucket) {
      console.log('Repository-files bucket found:', repositoryFilesBucket);
    } else {
      console.log('Repository-files bucket not found');
    }
    
    // Try to access the repository-files bucket
    console.log('Testing access to repository-files bucket...');
    const { data: testData, error: testError } = await supabase.storage
      .from('repository-files')
      .list('');
    
    if (testError) {
      console.error('Error accessing repository-files bucket:', testError);
    } else {
      console.log('Successfully accessed repository-files bucket');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testBucket();