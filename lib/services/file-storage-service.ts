import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

class FileStorageService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string = 'repository-files';

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured');
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async saveFile(file: File, originalFileName: string): Promise<{url: string, blobName: string, metadata: any}> {
    console.log('Starting file upload process to Azure Blob Storage...');
    
    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExt = this.getFileExtension(originalFileName).toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      throw new Error(`File type ${fileExt} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Generate a unique filename to prevent conflicts
    const uniqueFileName = `${randomUUID()}.${fileExt}`;
    console.log('Generated unique filename:', uniqueFileName);
    
    // Convert File object to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer, size:', buffer.length);
    
    // Basic security: scan file content for known malicious patterns
    await this.scanFileForMaliciousContent(buffer);
    console.log('File security scan completed');

    // Upload to Azure Blob Storage
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);
    
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: file.type || this.getMimeTypeFromExtension(fileExt)
      }
    };

    const uploadBlobResponse = await blockBlobClient.uploadData(buffer, uploadOptions);
    console.log('Upload result:', uploadBlobResponse.requestId);

    // Extract basic metadata from the file
    const metadata = {
      originalName: originalFileName,
      size: file.size,
      type: file.type,
      extension: fileExt,
      uploadedAt: new Date(),
      lastModified: file.lastModified ? new Date(file.lastModified) : new Date(),
      hash: createHash('sha256').update(buffer).digest('hex'), // File integrity hash
    };

    // Return both the URL and metadata, including the blob name
    return {
      url: blockBlobClient.url,
      blobName: uniqueFileName,
      metadata
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      console.log('Deleting file:', fileUrl);
      const fileName = this.getFileNameFromUrl(fileUrl);
      console.log('Extracted filename:', fileName);
      
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      const deleteResponse = await blockBlobClient.delete();
      console.log('Delete result:', deleteResponse.requestId);

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async getFileUrl(fileName: string, containerName: string = 'repository-files'): Promise<string> {
    console.log('Getting file URL for:', { fileName, containerName });
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Generate a time-limited SAS URL for secure access
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // URL expires in 1 hour
    
    // Get the account name from the connection string for SAS generation
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) {
      throw new Error('Azure Storage account name is not configured');
    }

    // Create SAS permissions object properly
    const permissions = new BlobSASPermissions();
    permissions.read = true;
    
    const sasOptions = {
      containerName: containerName,
      blobName: fileName,
      permissions: permissions,
      expiresOn: expiryDate,
    };
    
    // Get the account key for SAS generation
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured');
    }

    // Extract account key from connection string
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
    if (!accountKeyMatch) {
      throw new Error('Account key not found in connection string');
    }
    const accountKey = accountKeyMatch[1];
    
    // Create a StorageSharedKeyCredential for SAS generation
    const { StorageSharedKeyCredential } = await import('@azure/storage-blob');
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    
    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential);
    return `${blockBlobClient.url}?${sasToken}`;
  }

  async validateAndExtractMetadata(file: File, originalFileName: string) {
    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExt = this.getFileExtension(originalFileName).toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      throw new Error(`File type ${fileExt} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Extract metadata from the file
    const metadata = {
      originalName: originalFileName,
      size: file.size,
      type: file.type,
      extension: fileExt,
      uploadedAt: new Date(),
      lastModified: file.lastModified ? new Date(file.lastModified) : new Date(),
    };

    return metadata;
  }

  private async scanFileForMaliciousContent(buffer: Buffer): Promise<void> {
    // Basic security check: scan for known malicious patterns in file content
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // JavaScript in HTML
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, // iframe tags
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, // object tags
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, // embed tags
      /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, // form tags
      /javascript:/gi, // javascript: URLs
      /vbscript:/gi, // vbscript: URLs
      /onload=/gi, // onload events
      /onerror=/gi, // onerror events
      /onmouseover=/gi, // mouseover events
      /onfocus=/gi, // focus events
    ];

    const fileContent = buffer.toString('utf-8');

    for (const pattern of maliciousPatterns) {
      if (pattern.test(fileContent)) {
        throw new Error('File contains potentially malicious content');
      }
    }
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || '';
  }

  private getFileNameFromUrl(fileUrl: string): string {
    // Remove query parameters first (e.g., SAS tokens)
    const urlWithoutParams = fileUrl.split('?')[0];
    return urlWithoutParams.split('/').pop() || '';
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}

export default new FileStorageService();