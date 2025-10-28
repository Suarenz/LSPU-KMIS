import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script updates the repository-files bucket in Supabase with allowed MIME types
async function updateBucketMimeTypes() {
  console.log('Updating repository-files bucket MIME types in Supabase...\n');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
  );

  console.log('Supabase admin client created');

  try {
    // Check if bucket exists
    console.log('Checking if repository-files bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const existingBucket = buckets.find(bucket => bucket.name === 'repository-files');
    if (!existingBucket) {
      console.log('Repository-files bucket does not exist. Please create it first.');
      return;
    }
    
    console.log('Repository-files bucket found:', existingBucket.name);
    
    // Update the bucket with allowed MIME types
    console.log('Updating repository-files bucket with allowed MIME types...');
    const { error } = await supabase.storage.updateBucket('repository-files', {
      public: false, // Keep the bucket private
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
      console.error('Error updating bucket:', error);
      return;
    }
    
    console.log('Repository-files bucket MIME types updated successfully');
    console.log('\nBucket now allows the following MIME types:');
    console.log('- application/pdf (PDF files)');
    console.log('- application/msword (DOC files)');
    console.log('- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX files)');
    console.log('- application/vnd.ms-powerpoint (PPT files)');
    console.log('- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX files)');
    console.log('- application/vnd.ms-excel (XLS files)');
    console.log('- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (XLSX files)');
    console.log('- text/plain (TXT files)');
    console.log('- text/plain;charset=utf-8 (TXT files with UTF-8 encoding)');
    console.log('- text/plain; charset=utf-8 (TXT files with UTF-8 encoding, alternative format)');
    console.log('- image/jpeg (JPG files)');
    console.log('- image/png (PNG files)');
    
  } catch (error) {
    console.error('Error during bucket update:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  updateBucketMimeTypes().catch(console.error);
}

export default updateBucketMimeTypes;