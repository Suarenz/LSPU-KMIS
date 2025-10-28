import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';

class FileStorageService {
  private readonly bucketName: string = 'repository-files'; // Supabase bucket name

  constructor() {
    // Initialize Supabase client
 }

  async saveFile(file: File, originalFileName: string): Promise<{url: string, metadata: any}> {
    console.log('Starting file upload process...');
    console.log('File details:', {
      name: originalFileName,
      size: file.size,
      type: file.type
    });
    
    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExt = this.getFileExtension(originalFileName).toLowerCase();
    console.log('File extension:', fileExt);
    
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

    // Upload to Supabase Storage
    console.log('Initializing Supabase client...');
    const supabase = await createClient();
    console.log('Supabase client initialized');
    
    console.log('Uploading file to bucket:', this.bucketName);
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(uniqueFileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || this.getMimeTypeFromExtension(fileExt)
      });
    
    console.log('Upload result:', { data: !!data, error: !!error });
    if (error) {
      console.error('Supabase upload error:', error);
      // Provide more specific error messages based on common issues
      if (error.message.includes('Bucket not found')) {
        throw new Error(`Storage bucket '${this.bucketName}' not found. Please ensure the bucket exists in your Supabase project.`);
      } else if (error.message.includes('Access Denied')) {
        throw new Error(`Access denied to storage bucket '${this.bucketName}'. Please check your Supabase Storage RLS policies.`);
      } else {
        throw new Error(`Failed to upload file to Supabase: ${error.message}`);
      }
    }
    
    if (!data) {
      throw new Error('Upload completed but no data returned from Supabase');
    }
    
    console.log('File uploaded successfully:', data.path);

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

    // Return both the URL and metadata
    // Note: We'll return the filename for now; the full URL will be constructed when needed
    console.log('Returning upload result');
    return {
      url: uniqueFileName,
      metadata
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      console.log('Deleting file:', fileUrl);
      // Extract filename from URL
      const fileName = this.getFileNameFromUrl(fileUrl);
      console.log('Extracted filename:', fileName);
      
      const supabase = await createClient();
      console.log('Removing file from bucket:', this.bucketName);
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);
      
      console.log('Delete result:', { error: !!error });

      if (error) {
        console.error('Error deleting file from Supabase:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    console.log('Getting file URL for:', fileName);
    const supabase = await createClient();
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);
      
    console.log('Public URL result:', { data: !!data, publicUrl: data?.publicUrl });
    if (!data || !data.publicUrl) {
      throw new Error(`File ${fileName} does not exist`);
    }
    
    return data.publicUrl;
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
    return fileUrl.split('/').pop() || '';
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