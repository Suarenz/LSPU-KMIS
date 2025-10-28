const { createClient } = require('../lib/supabase/server');

async function checkBucket() {
  try {
    console.log('Checking Supabase bucket configuration...');
    
    const supabase = await createClient();
    
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
    
    // Try to upload a small test file
    console.log('Testing file upload...');
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const testFileName = 'test-upload.txt';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('repository-files')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading test file:', uploadError);
    } else {
      console.log('Test file uploaded successfully:', uploadData);
      
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
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkBucket();