# Comprehensive Azure Database Migration Plan for LSPU KMIS

## Overview

This document provides a detailed plan for migrating the LSPU Knowledge Management Information System (KMIS) database tables from Supabase PostgreSQL to Azure Database for PostgreSQL. The migration preserves all existing functionality, including the Role-Based Access Control (RBAC) system, document management, and user permissions.

## Current Database Schema

The LSPU KMIS system uses the following tables in PostgreSQL:

### Core Tables
1. **users** - Stores user information (id, email, name, password, role, unitId, etc.)
2. **documents** - Stores document metadata (id, title, description, category, tags, fileUrl, etc.)
3. **units** - Stores academic units/departments (id, name, code, description)
4. **document_permissions** - Stores document access permissions (documentId, userId, permission level)
5. **unit_permissions** - Stores unit access permissions (unitId, userId, permission level)
6. **document_comments** - Stores document comments and replies
7. **document_downloads** - Tracks document download history
8. **document_views** - Tracks document view history

### Enum Types
- `UserRole` - ADMIN, FACULTY, STUDENT, EXTERNAL
- `DocumentStatus` - ACTIVE, ARCHIVED, PENDING_REVIEW
- `PermissionLevel` - READ, WRITE, ADMIN

## Migration Steps

### Phase 1: Azure Database Setup

#### Step 1: Install Azure CLI
```bash
# Download and install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
```

#### Step 2: Sign in to Azure
```bash
az login
```

#### Step 3: Create Resource Group
```bash
az group create --name lspu-kmis-rg --location "East Asia"
```

#### Step 4: Create Azure Database for PostgreSQL
```bash
az postgres flexible-server create \
  --resource-group lspu-kmis-rg \
  --name lspu-kmis-db \
  --location "East Asia" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 20 \
  --version 14 \
  --admin-user lspuadmin \
  --admin-password <your_secure_password> \
 --public-access none
```

#### Step 5: Configure Firewall Rules
```bash
# To allow your IP address (replace with your actual IP)
az postgres flexible-server firewall-rule create \
  --resource-group lspu-kmis-rg \
  --name lspu-kmis-db \
  --rule-name AllowMyIP \
  --start-ip-address <your_ip_address> \
  --end-ip-address <your_ip_address>
```

#### Step 6: Enable Required Extensions
Connect to the database and enable required extensions:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Phase 2: Schema Migration

#### Step 1: Update Prisma Configuration
The Prisma schema file (`prisma/schema.prisma`) is already correctly configured to use environment variables.

#### Step 2: Update Environment Variables
Create or update your `.env.local` file with Azure configuration:

```env
# Azure Database for PostgreSQL
DATABASE_URL="postgresql://lspuadmin:<your_actual_password>@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://lspuadmin:<your_actual_password>@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="<your_actual_connection_string>"
AZURE_STORAGE_ACCOUNT_NAME="lspukmisstorage"
AZURE_STORAGE_CONTAINER_NAME="repository-files"

# JWT
JWT_SECRET="6dFk5d0vbyLnZC0Amy83LtI47DsNr/KB4M+FgbUc6njd4cjk7XB2/8nTuhQDWW8OOgQ6fI74huxJE3a/RP2giw=="
JWT_EXPIRES_IN="24h"

# File Upload
MAX_FILE_SIZE=5242800 # 50MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

#### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

#### Step 4: Deploy Schema to Azure Database
```bash
npx prisma db push
```

### Phase 3: Data Migration

#### Step 1: Backup Current Database
Create a backup of your current Supabase database:
```bash
pg_dump "your_supabase_connection_string" > lspu-kmis-supabase-backup.sql
```

Example:
```bash
pg_dump "postgresql://[DB-USER].[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres" > lspu-kmis-supabase-backup.sql
```

#### Step 2: Import Data to Azure Database
Import the backup to your Azure database:
```bash
psql "postgresql://lspuadmin:your_actual_password@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require" < lspu-kmis-supabase-backup.sql
```

#### Step 3: Verify Data Integrity
After the import, verify your data by connecting to the Azure database and running queries to check that all tables and data are present:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM units;
SELECT COUNT(*) FROM document_permissions;
SELECT COUNT(*) FROM unit_permissions;
```

### Phase 4: Storage Migration

#### Step 1: Create Azure Storage Account
```bash
az storage account create \
  --name lspukmisstorage \
  --resource-group lspu-kmis-rg \
  --location "East Asia" \
  --sku Standard_RAGRS \
  --kind StorageV2
```

#### Step 2: Create Blob Container
```bash
az storage container create \
  --name repository-files \
  --account-name lspukmisstorage \
  --auth-mode login
```

#### Step 3: Update File Storage Service
The `lib/services/file-storage-service.ts` file is already configured to use Azure Blob Storage.

#### Step 4: Install Azure Storage Dependencies
```bash
npm uninstall @supabase/storage-js
npm install @azure/storage-blob
```

### Phase 5: Application Configuration

#### Step 1: Update Application Code
The application code is already updated to use Azure services instead of Supabase.

#### Step 2: Test Database Connection
```bash
npx prisma db pull --schema prisma/schema.prisma
```

### Phase 6: Testing

#### Step 1: Test Application Functionality
- Verify user authentication and authorization
- Test document upload and download
- Validate permission checks and RBAC functionality
- Confirm search and filtering capabilities

#### Step 2: Functional Testing Checklist
- [ ] User registration and login work correctly
- [ ] Document upload and download work with Azure Blob Storage
- [ ] Permission checks work for different user roles
- [ ] Search functionality works as expected
- [ ] All API routes return correct data
- [ ] File URLs in the database point to Azure Blob Storage

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

## Risk Mitigation

- **Backup Strategy**: Always maintain backups before migration
- **Staged Rollout**: Consider a phased approach to minimize risk
- **Monitoring**: Implement comprehensive logging during migration
- **Rollback Plan**: Maintain ability to revert to original system if needed
- **Testing**: Thorough testing at each migration stage

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

- **Phase 1 (Database Setup)**: 1 day
- **Phase 2 (Schema Migration)**: 1 day
- **Phase 3 (Data Migration)**: 1-2 days (depending on data size)
- **Phase 4 (Storage Migration)**: 1 day
- **Phase 5 (Application Updates)**: 1 day
- **Phase 6 (Testing)**: 2-3 days
- **Total Estimated Time**: 6-9 days