const { createServerClient } = require('@supabase/ssr');

// Load environment variables
require('dotenv').config();

async function testFileUpload() {
  try {
    console.log('Testing file upload to repository-files bucket...');
    
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
    
    // Create a simple test file
    const testContent = 'This is a test file for upload testing';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = 'test-upload.txt';
    
    console.log('Uploading test file...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('repository-files')
      .upload(testFileName, testBlob, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading test file:', uploadError);
      return;
    }
    
    console.log('Test file uploaded successfully:', uploadData);
    
    // Get the public URL for the uploaded file
    console.log('Getting public URL for uploaded file...');
    const { data: publicUrlData } = await supabase.storage
      .from('repository-files')
      .getPublicUrl(testFileName);
    
    console.log('Public URL for file:', publicUrlData.publicUrl);
    
    // Clean up - delete the test file
    console.log('Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('repository-files')
      .remove([testFileName]);
    
    if (deleteError) {
      console.error('Error deleting test file:', deleteError);
    } else {
      console.log('Test file deleted successfully');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testFileUpload();