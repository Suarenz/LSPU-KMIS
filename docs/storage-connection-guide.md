# Azure Storage Connection Guide

This document explains how the LSPU KMIS system connects to Azure Blob Storage for document management.

## Overview

The LSPU KMIS system uses Azure Blob Storage to store and manage documents. The storage system is implemented using the `@azure/storage-blob` package and is integrated with the application through the `FileStorageService`.

## Configuration

### Environment Variables

The storage system requires the following environment variables to be configured in your `.env.local` file:

```env
# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=lspukmisstorage;AccountKey=...;EndpointSuffix=core.windows.net"
AZURE_STORAGE_ACCOUNT_NAME="lspukmisstorage"
AZURE_STORAGE_CONTAINER_NAME="repository-files"
```

### Connection String Format

The connection string follows the format:
```
DefaultEndpointsProtocol=https;AccountName={account-name};AccountKey={account-key};EndpointSuffix=core.windows.net
```

Where:
- `{account-name}` is your Azure Storage account name
- `{account-key}` is your Azure Storage account access key

## Implementation

### FileStorageService

The `FileStorageService` ([`lib/services/file-storage-service.ts`](lib/services/file-storage-service.ts:1)) handles all interactions with Azure Blob Storage:

1. **File Upload**: The `saveFile()` method uploads files to Azure Blob Storage
2. **File Deletion**: The `deleteFile()` method removes files from Azure Blob Storage
3. **URL Generation**: The `getFileUrl()` method generates access URLs for files

### Integration Points

The storage service is integrated into the application through:

1. **Document Upload API** ([`app/api/documents/route.ts`](app/api/documents/route.ts:89)): Handles file uploads and creates document records
2. **Document Download API** ([`app/api/documents/[id]/download/route.ts`](app/api/documents/[id]/download/route.ts:7)): Handles file downloads with access control
3. **Document Preview API** ([`app/api/documents/[id]/preview/route.ts`](app/api/documents/[id]/preview/route.ts:7)): Handles file previews with access control

## Security Features

The storage implementation includes several security measures:

1. **File Type Validation**: Only allowed file types are accepted (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, JPEG, PNG)
2. **File Size Limits**: Maximum file size is enforced (50MB by default)
3. **Malicious Content Scanning**: Files are scanned for known malicious patterns
4. **Access Control**: File access is controlled through the application's RBAC system

## Container Structure

- **Container Name**: `repository-files`
- **File Naming**: Files are stored with UUID-based names to prevent conflicts
- **Metadata**: File metadata is stored in the database, not in blob properties

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Verify the connection string is correct
   - Check that the storage account is accessible
   - Ensure the firewall settings allow connections

2. **Authentication Failed**:
   - Verify the account key is correct
   - Check that the account name matches the connection string

3. **Container Not Found**:
   - Ensure the `repository-files` container exists in your storage account
   - Verify the container name in environment variables matches the actual container name

### Testing Storage Connection

Use the storage connection test script to verify the configuration:

```bash
npx tsx scripts/test-storage-connection.ts
```

This script will:
- Connect to Azure Storage
- Verify container access
- Test upload and download functionality
- Clean up test files

## Best Practices

1. **Secure Connection Strings**: Never commit connection strings to version control
2. **Monitor Storage Usage**: Regularly monitor storage consumption and costs
3. **Backup Strategy**: Implement appropriate backup strategies for critical documents
4. **Access Logging**: Enable Azure Storage logging for security monitoring