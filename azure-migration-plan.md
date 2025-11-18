# Azure Migration Plan: LSPU KMIS Database and Storage Migration

## Overview

This document provides a detailed plan for migrating the LSPU Knowledge Management Information System (KMIS) from Supabase services to Microsoft Azure infrastructure, specifically:
- Azure Database for PostgreSQL (replacing Supabase PostgreSQL)
- Azure Blob Storage (replacing Supabase Storage)

## Prerequisites

### Required Tools
1. Azure CLI (needs to be installed)
2. PostgreSQL client tools (pg_dump, psql)
3. Node.js and npm for dependency management

### Azure Account Setup
1. Sign in to Azure portal
2. Ensure you have appropriate permissions to create resources

## Phase 1: Azure Database Setup

### Step 1: Install Azure CLI
Download and install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

### Step 2: Sign in to Azure
```bash
az login
```

### Step 3: Create Resource Group
```bash
az group create --name lspu-kmis-rg --location "East Asia"
```

### Step 4: Create Azure Database for PostgreSQL
```bash
az postgres flexible-server create \
  --resource-group lspu-kmis-rg \
  --name lspu-kmis-db \
  --location "East Asia" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 20 \
  --version 14 \
  --admin-user <admin_username> \
  --admin-password <admin_password> \
 --public-access none
```

### Step 5: Configure Firewall Rules
```bash
# To allow your IP address
az postgres flexible-server firewall-rule create \
  --resource-group lspu-kmis-rg \
  --name lspu-kmis-db \
  --rule-name AllowMyIP \
  --start-ip-address <your_ip_address> \
  --end-ip-address <your_ip_address>
```

### Step 6: Enable Required Extensions
Connect to the database and enable required extensions:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## Phase 2: Update Application Configuration

### Step 1: Update Prisma Configuration
The Prisma schema file (`prisma/schema.prisma`) is already correctly configured to use environment variables.

### Step 2: Install Azure Storage Dependencies
```bash
npm uninstall @supabase/storage-js
npm install @azure/storage-blob
```

### Step 3: Update Environment Variables
Create a new `.env.local` file with Azure configuration:

```env
# Azure Database for PostgreSQL
DATABASE_URL="postgresql://<admin_username>:<admin_password>@lspu-kmis-db.postgres.database.azure.com:5432/lspu_kmis?sslmode=require"
DIRECT_URL="postgresql://<admin_username>:<admin_password>@lspu-kmis-db.postgres.database.azure.com:5432/lspu_kmis?sslmode=require"

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="your_connection_string"
AZURE_STORAGE_ACCOUNT_NAME="lspukmisstorage"
AZURE_STORAGE_CONTAINER_NAME="repository-files"

# Remove or comment out Supabase variables
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

## Phase 3: Schema Migration

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Deploy Schema to Azure Database
```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

## Phase 4: Data Migration

### Step 1: Export Current Data from Supabase
```bash
# Replace with your actual Supabase connection details
pg_dump "postgresql://[DB-USER].[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres" > lspu-kmis-backup.sql
```

### Step 2: Import Data to Azure Database
```bash
psql "postgresql://<admin_username>:<admin_password>@lspu-kmis-db.postgres.database.azure.com:5432/lspu_kmis?sslmode=require" < lspu-kmis-backup.sql
```

### Step 3: Verify Data Integrity
- Compare row counts between source and target
- Verify foreign key relationships
- Validate user and document data

## Phase 5: Storage Migration

### Step 1: Create Azure Storage Account
```bash
az storage account create \
  --name lspukmisstorage \
  --resource-group lspu-kmis-rg \
  --location "East Asia" \
  --sku Standard_RAGRS \
  --kind StorageV2
```

### Step 2: Create Blob Container
```bash
az storage container create \
  --name repository-files \
  --account-name lspukmisstorage \
  --auth-mode login
```

### Step 3: Update File Storage Service
Replace the implementation in `lib/services/file-storage-service.ts` with the Azure Blob Storage implementation as detailed in the migration document.

## Phase 6: Testing

### Step 1: Test Database Connection
```bash
npx prisma db pull --schema prisma/schema.prisma
```

### Step 2: Test Application Functionality
- Verify user authentication and authorization
- Test document upload and download
- Validate permission checks and RBAC functionality
- Confirm search and filtering capabilities

## Rollback Plan

If issues arise during migration:

### Database Rollback
1. Restore from the backup created before migration
2. Revert environment variables to use previous connection strings
3. Revert any code changes related to database connections

### Storage Rollback
1. Restore file URLs in the database to point back to previous storage
2. Revert FileStorageService implementation if needed

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

## Risk Mitigation

- **Backup Strategy**: Always maintain backups before migration
- **Staged Rollout**: Consider a phased approach to minimize risk
- **Monitoring**: Implement comprehensive logging during migration
- **Rollback Plan**: Maintain ability to revert to original system if needed
- **Testing**: Thorough testing at each migration stage