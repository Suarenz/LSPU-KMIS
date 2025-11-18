import { BlobServiceClient } from '@azure/storage-blob';
require('dotenv').config();

async function testStorageConnection() {
  console.log('Testing Azure Storage connection...');
  
  // Get the connection string from environment variables
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING is not set in environment variables');
    return;
  }
  
  try {
    // Create a BlobServiceClient using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Test connection by trying to list containers
    console.log('Attempting to connect to Azure Storage...');
    const containers = await blobServiceClient.listContainers().byPage({ maxPageSize: 5 }).next();
    const response = await containers.value;
    
    console.log('✅ Successfully connected to Azure Storage!');
    console.log('Available containers:', response.containerItems?.map((c: any) => c.name) || 'None');
    
    // Check if the required container exists
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'repository-files';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Try to access the container (this will tell us if it exists)
    try {
      const properties = await containerClient.getProperties();
      console.log(`✅ Container '${containerName}' exists and is accessible`);
      console.log('Container properties retrieved successfully');
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.warn(`⚠️  Container '${containerName}' does not exist. You may need to create it.`);
      } else {
        console.error(`❌ Error accessing container '${containerName}':`, error.message);
      }
    }
    
    // Test upload functionality with a small test file
    console.log('Testing upload functionality...');
    const testBlockBlobClient = containerClient.getBlockBlobClient('test-connection.txt');
    const testData = `Test file to verify storage connection\nCreated at: ${new Date().toISOString()}`;
    
    const uploadResponse = await testBlockBlobClient.upload(testData, testData.length);
    
    if (uploadResponse.errorCode) {
      console.error('❌ Error uploading test file:', uploadResponse.errorCode);
    } else {
      console.log('✅ Test file uploaded successfully');
      
      // Try to download the test file to verify read access
      console.log('Testing download functionality...');
      const downloadResponse = await testBlockBlobClient.download();
      if (downloadResponse.errorCode) {
        console.error('❌ Error downloading test file:', downloadResponse.errorCode);
      } else {
        console.log('✅ Test file downloaded successfully');
      }
      
      // Clean up the test file
      await testBlockBlobClient.delete();
      console.log('🧹 Test file cleaned up');
    }
    
    console.log('\n🎉 Storage connection test completed successfully!');
    console.log('✅ Azure Storage is properly configured and accessible');
    
  } catch (error: any) {
    console.error('❌ Error connecting to Azure Storage:', error.message || error);
    if (error.code === 'ECONNREFUSED') {
      console.error('This may indicate network connectivity issues or firewall restrictions.');
    } else if (error.code === 'AuthenticationFailed') {
      console.error('This likely indicates an incorrect connection string or access key.');
    }
 }
}

// Run the test
testStorageConnection().then(() => {
  console.log('Storage connection test finished.');
}).catch((error) => {
  console.error('Storage connection test failed:', error);
});