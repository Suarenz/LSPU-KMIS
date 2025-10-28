import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// This script creates the repository-files bucket in Supabase if it doesn't exist
async function createRepositoryBucket() {
  console.log('Creating repository-files bucket in Supabase...\n');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
 );

  console.log('Supabase admin client created');

  try {
    // Check if bucket already exists
    console.log('Checking if repository-files bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const existingBucket = buckets.find(bucket => bucket.name === 'repository-files');
    if (existingBucket) {
      console.log('Repository-files bucket already exists:', existingBucket.name);
      console.log('Bucket public:', existingBucket.public);
      return;
    }
    
    // Create the bucket with allowed MIME types
    console.log('Creating repository-files bucket...');
    const { data, error } = await supabase.storage.createBucket('repository-files', {
      public: false, // Set to false for security - access controlled by RLS policies
      fileSizeLimit: 52428800, // 50MB limit
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/plain;charset=utf-8',
        'text/plain; charset=utf-8',
        'image/jpeg',
        'image/png'
      ]
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }
    
    console.log('Repository-files bucket created successfully:', data);
    console.log('\nNext steps:');
    console.log('1. Apply the RLS policies using the SQL commands from the previous step');
    console.log('2. Test the file upload functionality');
    
  } catch (error) {
    console.error('Error during bucket creation:', error);
  }
}

// Run the script when this file is executed directly
async function main() {
  if (typeof process !== 'undefined' && process.argv) {
    // Check if this script is being run directly (not imported)
    const scriptPath = import.meta.url.replace('file://', '');
    const currentFile = process.argv[1];
    
    if (currentFile && currentFile.includes('create-repository-bucket')) {
      await createRepositoryBucket();
    }
  }
}

main().catch(console.error);

export default createRepositoryBucket;