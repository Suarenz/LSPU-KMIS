# Migration Verification Plan for LSPU KMIS to Azure Database

## Overview

This document outlines the comprehensive verification steps to ensure that the migration of LSPU KMIS tables from Supabase to Azure Database for PostgreSQL was completed successfully. The verification process includes data integrity checks, functionality testing, and RBAC system validation.

## Pre-Migration Verification

### 1. Database Schema Verification
- [ ] Confirm all tables exist in Azure database
- [ ] Verify table structures match source database
- [ ] Validate all indexes are properly created
- [ ] Confirm enum types are correctly defined
- [ ] Check foreign key constraints are in place
- [ ] Verify unique constraints are maintained

### 2. Data Integrity Verification
- [ ] Count records in each table before and after migration
- [ ] Verify primary keys are preserved
- [ ] Confirm foreign key relationships are intact
- [ ] Validate data types match between source and target
- [ ] Check for any data truncation or conversion issues
- [ ] Verify that special characters and Unicode data are preserved

### 3. Environment Configuration Verification
- [ ] Test database connection with new environment variables
- [ ] Verify Azure Storage connection works correctly
- [ ] Confirm all required environment variables are set
- [ ] Validate SSL connection to Azure Database

## Post-Migration Verification

### 4. Database Connection Testing

#### 4.1 Connection Validation
```bash
# Test database connection using Prisma
npx prisma db pull --schema prisma/schema.prisma

# Test direct connection
npx prisma db pull

# Verify connection with psql
psql "postgresql://lspuadmin:your_password@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

#### 4.2 Schema Verification Queries
```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verify enum types exist
SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'UserRole';
SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'PermissionLevel';
SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'DocumentStatus';

-- Check table row counts
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS document_count FROM documents;
SELECT COUNT(*) AS unit_count FROM units;
SELECT COUNT(*) AS doc_permission_count FROM document_permissions;
SELECT COUNT(*) AS unit_permission_count FROM unit_permissions;
SELECT COUNT(*) AS comment_count FROM document_comments;
SELECT COUNT(*) AS download_count FROM document_downloads;
SELECT COUNT(*) AS view_count FROM document_views;
```

### 5. Data Integrity Verification

#### 5.1 Record Count Verification
Compare record counts between source (Supabase) and target (Azure) databases:

| Table | Supabase Count | Azure Count | Status |
|-------|----------------|-------------|--------|
| users | ? | ? | ? |
| documents | ? | ? | ? |
| units | ? | ? | ? |
| document_permissions | ? | ? | ? |
| unit_permissions | ? | ? | ? |
| document_comments | ? | ? | ? |
| document_downloads | ? | ? | ? |
| document_views | ? | ? | ? |

#### 5.2 Sample Data Verification
Check sample records from each table to ensure data integrity:
```sql
-- Sample user verification
SELECT id, email, name, role FROM users LIMIT 5;

-- Sample document verification
SELECT id, title, uploadedBy, fileUrl FROM documents LIMIT 5;

-- Sample permission verification
SELECT id, documentId, userId, permission FROM document_permissions LIMIT 5;

-- Sample unit verification
SELECT id, name, code FROM units LIMIT 5;
```

#### 5.3 Foreign Key Relationship Verification
```sql
-- Verify document permissions link to existing documents and users
SELECT dp.id, dp.documentId, dp.userId 
FROM document_permissions dp 
WHERE NOT EXISTS (SELECT 1 FROM documents d WHERE d.id = dp.documentId) 
   OR NOT EXISTS (SELECT 1 FROM users u WHERE u.id = dp.userId);

-- Verify unit permissions link to existing units and users
SELECT up.id, up.unitId, up.userId 
FROM unit_permissions up 
WHERE NOT EXISTS (SELECT 1 FROM units u WHERE u.id = up.unitId) 
   OR NOT EXISTS (SELECT 1 FROM users usr WHERE usr.id = up.userId);

-- Verify documents link to existing users and units
SELECT d.id, d.uploadedById, d.unitId 
FROM documents d 
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = d.uploadedById);

-- Verify users link to existing units (where applicable)
SELECT u.id, u.unitId 
FROM users u 
WHERE u.unitId IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM units un WHERE un.id = u.unitId);
```

### 6. Application Functionality Testing

#### 6.1 User Authentication and Authorization
- [ ] Test user login with different role types (ADMIN, FACULTY, STUDENT, EXTERNAL)
- [ ] Verify JWT token generation and validation
- [ ] Confirm user session management works correctly
- [ ] Test user profile access and updates

#### 6.2 Document Management
- [ ] Test document upload functionality with Azure Blob Storage
- [ ] Verify document download works correctly
- [ ] Confirm document metadata is preserved
- [ ] Test document search functionality
- [ ] Verify document versioning (if applicable)
- [ ] Test document comments functionality
- [ ] Verify document access statistics (downloads, views)

#### 6.3 RBAC System Validation
- [ ] Test ADMIN user access to all system functions
- [ ] Verify FACULTY users have appropriate document management rights
- [ ] Confirm STUDENT users have basic access rights only
- [ ] Test EXTERNAL users have limited access as configured
- [ ] Verify document READ permissions work correctly
- [ ] Test document WRITE permissions work correctly
- [ ] Confirm document ADMIN permissions work correctly
- [ ] Test unit-based access controls
- [ ] Verify permission inheritance functions properly

#### 6.4 Unit Management
- [ ] Test unit creation and management
- [ ] Verify unit permissions work correctly
- [ ] Confirm unit-based document filtering
- [ ] Test cross-unit access restrictions

### 7. File Storage Verification

#### 7.1 Azure Blob Storage Integration
- [ ] Verify new file uploads go to Azure Blob Storage
- [ ] Confirm file URLs point to Azure storage
- [ ] Test file download functionality from Azure storage
- [ ] Verify file metadata is preserved
- [ ] Test file deletion functionality
- [ ] Confirm file security scanning works

#### 7.2 File URL Updates
- [ ] Verify existing document file URLs are updated to Azure format
- [ ] Test access to previously uploaded documents
- [ ] Confirm file URLs are accessible and valid

### 8. Performance Verification

#### 8.1 Database Performance
- [ ] Test query response times for common operations
- [ ] Verify database connection pooling works correctly
- [ ] Test concurrent user access
- [ ] Confirm no significant performance degradation

#### 8.2 Application Performance
- [ ] Test page load times
- [ ] Verify API response times
- [ ] Confirm file upload/download speeds are acceptable
- [ ] Test application under load conditions

### 9. Security Verification

#### 9.1 Access Control Verification
- [ ] Confirm unauthorized users cannot access protected resources
- [ ] Verify role-based access controls function correctly
- [ ] Test permission escalation attempts are blocked
- [ ] Confirm sensitive data is properly protected

#### 9.2 Data Security
- [ ] Verify user passwords are properly encrypted
- [ ] Confirm sensitive data is not exposed inappropriately
- [ ] Test data encryption in transit (SSL)
- [ ] Verify file security scanning functions properly

### 10. Error Handling Verification

#### 10.1 Database Error Handling
- [ ] Test application behavior when database is unavailable
- [ ] Verify proper error messages for database connection issues
- [ ] Confirm graceful degradation when database errors occur

#### 10.2 Storage Error Handling
- [ ] Test application behavior when storage is unavailable
- [ ] Verify proper error messages for storage connection issues
- [ ] Confirm graceful degradation when storage errors occur

## Rollback Verification (If Needed)

If rollback is necessary, verify:

- [ ] Supabase database connection works correctly
- [ ] All functionality restored to pre-migration state
- [ ] Data integrity maintained in source database
- [ ] Application operates normally with original configuration

## Final Verification Checklist

### 11. Complete System Verification
- [ ] All tables migrated successfully with data integrity
- [ ] RBAC system functions identically to pre-migration
- [ ] User authentication and authorization work correctly
- [ ] Document management functions properly
- [ ] File storage uses Azure Blob Storage
- [ ] All API endpoints return correct data
- [ ] Frontend displays data correctly
- [ ] Performance meets or exceeds pre-migration levels
- [ ] Security measures are properly implemented
- [ ] Error handling works appropriately

### 12. Documentation Updates
- [ ] Update architecture diagrams to reflect Azure services
- [ ] Update deployment documentation
- [ ] Update operational procedures for Azure services
- [ ] Document any changes to monitoring and alerting

## Migration Success Criteria

The migration is considered successful when:

1. All database tables and data are successfully transferred to Azure Database
2. All application functionality works identically to pre-migration state
3. RBAC system operates without any changes to behavior
4. Performance metrics meet or exceed pre-migration levels
5. All security measures are properly implemented
6. File storage operations work correctly with Azure Blob Storage
7. All tests pass without errors or unexpected behavior

## Post-Migration Monitoring

After successful migration, monitor:

1. Application logs for any errors or warnings
2. Database performance metrics
3. Storage usage and performance
4. User feedback and reported issues
5. Security events and access patterns