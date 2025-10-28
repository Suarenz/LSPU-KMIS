const { createServerClient } = require('@supabase/ssr');

// Load environment variables
require('dotenv').config();

async function createRepositoryBucket() {
  try {
    console.log('Creating repository-files bucket...');
    
    // Create Supabase client with service role key for admin operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role key for admin operations
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
    
    console.log('Supabase admin client created');
    
    // Create the repository-files bucket
    console.log('Creating repository-files bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('repository-files', {
      public: false, // Set to false for private bucket with RLS policies
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
    
    if (bucketError) {
      console.error('Error creating bucket:', bucketError);
      return;
    }
    
    console.log('Bucket created successfully:', bucketData);
    
    // Set bucket to public (optional, depending on your requirements)
    console.log('Setting bucket to public...');
    const { error: publicError } = await supabase.storage.updateBucket('repository-files', {
      public: true
    });
    
    if (publicError) {
      console.error('Error setting bucket to public:', publicError);
    } else {
      console.log('Bucket set to public successfully');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createRepositoryBucket();