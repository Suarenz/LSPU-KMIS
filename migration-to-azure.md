# Migration Plan: LSPU KMIS from Database Authentication to Azure Database for PostgreSQL and Azure Blob Storage

## Table of Contents
1. [Overview](#overview)
2. [Current Architecture](#current-architecture)
3. [Target Architecture](#target-architecture)
4. [Migration Prerequisites](#migration-prerequisites)
5. [Database Migration](#database-migration)
6. [File Storage Migration](#file-storage-migration)
7. [Application Configuration Changes](#application-configuration-changes)
8. [RBAC System Preservation](#rbac-system-preservation)
9. [Testing Plan](#testing-plan)
10. [Rollback Plan](#rollback-plan)
1. [Post-Migration Tasks](#post-migration-tasks)

## Overview

This document outlines the migration of the LSPU Knowledge Management Information System (KMIS) from the existing database authentication system to Microsoft Azure infrastructure, specifically:
- Azure Database for PostgreSQL
- Azure Blob Storage

The migration preserves all existing functionality, including the Role-Based Access Control (RBAC) system, document management, and user permissions.

## Current Architecture

The current system uses:
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Storage**: Supabase Storage for document files
- **Authentication**: Custom JWT system with Supabase Auth integration
- **Frontend**: Next.js 15 application with TypeScript
- **UI Components**: Shadcn/ui library with Tailwind CSS

## Target Architecture

The target system will use:
- **Database**: Azure Database for PostgreSQL with Prisma ORM
- **Storage**: Azure Blob Storage for document files
- **Authentication**: Maintained custom JWT system (or optionally Azure AD B2C)
- **Frontend**: Same Next.js 15 application with TypeScript
- **UI Components**: Same Shadcn/ui library with Tailwind CSS

## Migration Prerequisites

### Azure Resources Required
- Azure Database for PostgreSQL Flexible Server instance
- Azure Storage Account with Blob Storage
- Azure Resource Group for resource organization
- Azure Virtual Network (if required for security)

### Tools Required
- Azure CLI
- PostgreSQL client tools (for data migration)
- Azure Storage Explorer (optional, for verification)

### Access Requirements
- Azure subscription with appropriate permissions
- Database backup of current Supabase instance
- Access to current `.env` configuration files

## Database Migration

### Phase 1: Azure Database Setup
1. **Create Azure Database for PostgreSQL instance**
   - Resource Group: `lspu-kmis-rg`
   - Server name: `lspu-kmis-db`
   - Region: Choose based on user location
   - Version: PostgreSQL 14 or later
   - Compute + Storage: Based on current usage patterns

2. **Configure Database Security**
   - Enable SSL enforcement
   - Configure firewall rules for application access
   - Set up database users with appropriate permissions
   - Disable public access if using VNet

3. **Install Required Extensions**
   - Ensure extensions like `uuid-ossp` and `pgcrypto` are enabled

### Phase 2: Schema Migration
1. **Update Prisma Configuration**
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

2. **Deploy Schema to Azure Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Deploy schema to Azure Database
   npx prisma migrate deploy --schema prisma/schema.prisma
   ```

### Phase 3: Data Migration
1. **Export Current Data**
   ```bash
   # Export from Supabase database
   pg_dump "postgresql://[DB-USER].[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres" > lspu-kmis-backup.sql
   ```

2. **Import Data to Azure Database**
   ```bash
   # Import to Azure Database
   psql "postgresql://username:password@lspu-kmis-db.postgres.database.azure.com:5432/lspu_kmis" < lspu-kmis-backup.sql
   ```

3. **Verify Data Integrity**
   - Compare row counts between source and target
   - Verify foreign key relationships
   - Validate user and document data

## File Storage Migration

### Phase 1: Azure Blob Storage Setup
1. **Create Storage Account**
   - Account name: `lspukmisstorage`
   - Performance: Standard
   - Replication: Geo-redundant storage (GRS)
   - Access tier: Hot

2. **Create Blob Container**
   - Container name: `repository-files`
   - Public access level: Private (container)

3. **Configure CORS Settings**
   - Add your application domain to CORS rules
   - Allow appropriate HTTP methods

### Phase 2: Update Application Code
1. **Install Azure Storage Dependencies**
   ```bash
   npm uninstall @supabase/storage-js
   npm install @azure/storage-blob
   ```

2. **Update File Storage Service**
   Replace `lib/services/file-storage-service.ts` with Azure Blob Storage implementation:

   ```typescript
   import { BlobServiceClient } from '@azure/storage-blob';
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

     async saveFile(file: File, originalFileName: string): Promise<{url: string, metadata: any}> {
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

       // Return both the URL and metadata
       return {
         url: blockBlobClient.url,
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

     async getFileUrl(fileName: string): Promise<string> {
       console.log('Getting file URL for:', fileName);
       const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
       const blockBlobClient = containerClient.getBlockBlobClient(fileName);
       
       return blockBlobClient.url;
     }

     // ... other methods remain the same as in the original implementation
   }

   export default new FileStorageService();
   ```

### Phase 3: Migrate Existing Files
1. **Export Current Files from Supabase Storage**
   - Download all files from the `repository-files` bucket in Supabase

2. **Upload Files to Azure Blob Storage**
   - Upload all files to the `repository-files` container in Azure

3. **Update File URLs in Database**
   - Update the `fileUrl` field in the `documents` table to use Azure Blob Storage URLs
   - The format will change from Supabase URLs to Azure Blob Storage URLs

## Application Configuration Changes

### Environment Variables
Update your `.env` file with new Azure service connections:

```env
# Azure Database for PostgreSQL
DATABASE_URL="postgresql://username:password@lspu-kmis-db.postgres.database.azure.com:5432/lspu_kmis?sslmode=require"
DIRECT_URL="postgresql://username:password@lspu-kmis-db.postgres.database.azure.com:5432/lspu_kmis?sslmode=require"

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="your_connection_string"
AZURE_STORAGE_ACCOUNT_NAME="lspukmisstorage"
AZURE_STORAGE_CONTAINER_NAME="repository-files"

# Remove or comment out Supabase variables
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### Authentication Considerations
The current system uses a custom JWT implementation with Supabase Auth. You have two options:

**Option 1: Continue with Custom JWT System**
- Keep the existing authentication implementation
- Update any database queries related to user management

**Option 2: Migrate to Azure AD B2C**
- Replace custom JWT system with Azure AD B2C
- More complex but provides enterprise-grade authentication
- Better integration with other Microsoft services

## RBAC System Preservation

### Current RBAC Implementation
The existing Role-Based Access Control system will continue to function without changes:

- **User Roles**: ADMIN, FACULTY, STUDENT, EXTERNAL (in the database)
- **Document Permissions**: READ, WRITE, ADMIN levels
- **Unit Permissions**: Department/unit-based access control
- **Business Logic**: Implemented in application services and middleware

### Migration Impact on RBAC
- **Database Schema**: Roles and permissions tables remain unchanged
- **Application Logic**: All permission checking code remains the same
- **Middleware**: Access control middleware continues to work as before
- **API Routes**: Document access controls remain intact

### RBAC Components Preserved
- User role assignments in the `users` table
- Document permissions in the `document_permissions` table
- Unit permissions in the `unit_permissions` table
- Permission checking logic in `lib/services/unit-permission-service.ts`
- Access control middleware in `lib/middleware/auth-middleware.ts`

## Testing Plan

### Pre-Migration Testing
1. **Schema Validation**
   - Verify all tables and relationships are correctly created in Azure
   - Test basic CRUD operations with Prisma

2. **Connection Testing**
   - Test database connectivity with new Azure connection strings
   - Verify SSL connection settings

### Post-Migration Testing
1. **Functional Testing**
   - User authentication and authorization
   - Document upload and download
   - Permission checks and RBAC functionality
   - Search and filtering capabilities

2. **Performance Testing**
   - Database query performance
   - File upload/download speeds
   - Application response times

3. **Security Testing**
   - Verify RBAC system works correctly
   - Test access controls for different user roles
   - Validate file security scanning

## Rollback Plan

If issues arise during migration:

### Database Rollback
1. Restore from the backup created before migration
2. Revert environment variables to use Supabase connection strings
3. Revert any code changes related to database connections

### Storage Rollback
1. Restore file URLs in the database to point back to Supabase Storage
2. Revert FileStorageService implementation to use Supabase
3. Reinstall Supabase storage dependencies

### Application Rollback
1. Revert all code changes made for Azure integration
2. Restore original environment variables
3. Verify all functionality works as before

## Post-Migration Tasks

### 1. Performance Optimization
- Set up database indexes based on query patterns
- Configure connection pooling for optimal performance
- Optimize blob storage access patterns

### 2. Monitoring and Alerting
- Set up Azure Monitor for database performance
- Configure storage analytics for blob usage
- Implement application logging for Azure services

### 3. Security Hardening
- Review and optimize firewall rules
- Implement Azure Security Center recommendations
- Set up audit logging for database access

### 4. Documentation Updates
- Update architecture diagrams to reflect Azure services
- Update deployment documentation
- Update operational procedures for Azure services

## Timeline Estimate

- **Phase 1 (Database Setup)**: 1-2 days
- **Phase 2 (Schema Migration)**: 1 day
- **Phase 3 (Data Migration)**: 1-2 days (depending on data size)
- **Phase 4 (Storage Migration)**: 1 day
- **Phase 5 (Application Updates)**: 1-2 days
- **Phase 6 (Testing)**: 2-3 days
- **Total Estimated Time**: 7-11 days

## Risk Mitigation

- **Backup Strategy**: Always maintain backups before migration
- **Staged Rollout**: Consider a phased approach to minimize risk
- **Monitoring**: Implement comprehensive logging during migration
- **Rollback Plan**: Maintain ability to revert to original system if needed
- **Testing**: Thorough testing at each migration stage