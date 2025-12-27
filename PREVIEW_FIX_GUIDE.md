# Document Preview Issue - Troubleshooting Guide

## Issue
**Error:** "Failed to generate preview URL" when viewing documents in Docker environment

## Root Cause
The Azure Blob Storage service is not properly configured in the Docker container, specifically:
1. Missing `AZURE_STORAGE_ACCOUNT_NAME` environment variable
2. Connection string might not be properly passed to container
3. Error details were not being logged properly

## ✅ Fixes Applied

### 1. Enhanced Error Logging ([app/api/documents/[id]/preview/route.ts](app/api/documents/[id]/preview/route.ts))
Added detailed error logging to show:
- File name being accessed
- Container name
- Full error message and stack trace
- Environment-specific error details

### 2. Added Missing Environment Variables ([docker-compose.yml](docker-compose.yml))
Added to Docker environment:
```yaml
AZURE_STORAGE_ACCOUNT_NAME: ${AZURE_STORAGE_ACCOUNT_NAME:-}
AZURE_STORAGE_CONTAINER_NAME: ${AZURE_STORAGE_CONTAINER_NAME:-}
```

## 🔍 How to Diagnose

### Step 1: Check Environment Variables
```bash
# In your Docker container
docker exec -it lspu-kmis-app sh
echo $AZURE_STORAGE_CONNECTION_STRING
echo $AZURE_STORAGE_ACCOUNT_NAME
exit
```

**Expected:** Should show your Azure Storage credentials

### Step 2: Check Docker Logs
```bash
# View app logs
docker logs lspu-kmis-app --tail 50 -f

# Look for errors like:
# ❌ Error getting file URL: Error: Azure Storage account name is not configured
# OR
# ❌ Error getting file URL: Error: Azure Storage connection string is not configured
```

### Step 3: Test with Development Server
```bash
# Run without Docker
npm run dev

# Try accessing: http://localhost:3001/repository/preview/<document-id>
# This should work if Azure credentials are correct
```

## 🚀 Solutions

### Solution 1: Use .env.local for Docker (Recommended)
Create a `.env.local` file with all your Azure credentials:

```bash
# .env.local
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=lspukmisstorage;AccountKey=YOUR_KEY_HERE;EndpointSuffix=core.windows.net"
AZURE_STORAGE_ACCOUNT_NAME="lspukmisstorage"
AZURE_STORAGE_CONTAINER_NAME="repository-files"
```

Then update `docker-compose.yml` to use it:
```yaml
app:
  env_file:
    - .env.local
```

### Solution 2: Pass Environment Variables Directly
Update `docker-compose.yml`:
```yaml
environment:
  AZURE_STORAGE_CONNECTION_STRING: "DefaultEndpointsProtocol=https;AccountName=lspukmisstorage;AccountKey=YOUR_KEY_HERE;EndpointSuffix=core.windows.net"
  AZURE_STORAGE_ACCOUNT_NAME: "lspukmisstorage"
  AZURE_STORAGE_CONTAINER_NAME: "repository-files"
```

### Solution 3: Rebuild Docker Container
After updating environment variables:
```bash
# Stop and rebuild
docker-compose down
docker-compose up -d --build

# Check if environment is set
docker exec -it lspu-kmis-app env | grep AZURE
```

## 🧪 Test the Fix

### Test Script (PowerShell)
```powershell
# Wait for server to start
Start-Sleep -Seconds 5

# Test API health
$health = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
Write-Host "Health Status: $($health.status)"

# Test document preview (replace with actual document ID)
$docId = "cmjiqkwnq0001iv012hfq33ra"
try {
    $preview = Invoke-RestMethod -Uri "http://localhost:3000/api/documents/$docId/preview" `
        -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}
    Write-Host "✓ Preview URL generated: $($preview.previewUrl)"
} catch {
    Write-Host "✗ Preview failed: $_"
}
```

## 📊 Expected Behavior

### Working Correctly:
```json
{
  "id": "cmjiqkwnq0001iv012hfq33ra",
  "title": "Document Title",
  "fileName": "file.pdf",
  "fileType": "pdf",
  "previewUrl": "https://lspukmisstorage.blob.core.windows.net/repository-files/file.pdf?sv=2023..."
}
```

### Still Failing:
```json
{
  "error": "Failed to generate preview URL",
  "details": "Azure Storage account name is not configured"
}
```

## 🔐 Security Note

**Never commit `.env` or `.env.local` files to Git!**

Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

## 📱 Quick Fix for Development

If Docker is giving you trouble, continue using the development server:

```bash
npm run dev
# Access: http://localhost:3001
```

This uses your local `.env` file directly and works perfectly for development!

## 🐛 Still Not Working?

1. **Check Azure Portal**
   - Verify storage account exists: `lspukmisstorage`
   - Check if containers exist: `repository-files`, `qpro-files`
   - Verify access keys are correct

2. **Check File Exists**
   - Go to Azure Portal → Storage Account → Containers
   - Navigate to `repository-files`
   - Search for the file by name

3. **Test Connection String**
   ```bash
   # Use Azure Storage Explorer or CLI
   az storage blob list \
     --account-name lspukmisstorage \
     --container-name repository-files \
     --connection-string "YOUR_CONNECTION_STRING"
   ```

4. **Contact Support**
   - Provide Docker logs
   - Provide error details from browser console
   - Confirm Azure credentials are valid

---

**Updated:** December 23, 2025
**Status:** Fixed with enhanced error logging and environment configuration
