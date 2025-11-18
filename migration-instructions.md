# LSPU KMIS - Migration to Azure Database and Storage

This document provides instructions for completing the migration of the LSPU KMIS system from Supabase to Azure services.

## Prerequisites

- Azure Database for PostgreSQL instance (already created)
- Azure Storage Account with Blob Storage (already created)
- Azure CLI installed (if needed for additional operations)
- pg_dump and psql utilities installed for database migration

## Required Configuration Updates

Before proceeding with the migration, you need to update the following in your `.env` file:

1. Replace `<your_actual_password>` in both `DATABASE_URL` and `DIRECT_URL` with your actual Azure database password
2. Replace `<your_connection_string>` in `AZURE_STORAGE_CONNECTION_STRING` with your actual Azure storage connection string

## Step-by-Step Migration Process

### 1. Backup Current Database
Create a backup of your current Supabase database:
```bash
pg_dump "your_supabase_connection_string" > lspu-kmis-supabase-backup.sql
```

Example:
```bash
pg_dump "postgresql://[DB-USER].[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres" > lspu-kmis-supabase-backup.sql
```

### 2. Import Data to Azure Database
Import the backup to your Azure database:
```bash
psql "postgresql://lspuadmin:your_actual_password@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require" < lspu-kmis-supabase-backup.sql
```

### 3. Verify Migration
After the import, verify your data by connecting to the Azure database and running queries to check that all tables and data are present.

### 4. Update Application
Once the database migration is complete, you can start your application with the new Azure configuration:
```bash
npm run dev
```

### 5. Test Functionality
- Test document upload and download functionality
- Verify that user authentication works
- Check that all application features work as expected
- Test the file storage functionality with Azure Blob Storage

## Troubleshooting

### Database Connection Issues
- Ensure your Azure database firewall allows connections from your IP address
- Verify your database credentials are correct
- Make sure SSL is enabled in your connection string

### Storage Issues
- Ensure your Azure storage connection string is correct
- Verify the storage container name is correct
- Check that your application has the required permissions

### Application Issues
- Make sure all environment variables are properly set
- Check that the Prisma client is generated with `npx prisma generate`
- Verify that the database schema is properly deployed

## Rollback Plan

If you encounter issues and need to revert to the previous configuration:

1. Uncomment the previous configuration in your `.env` file
2. Comment out or remove the Azure database configuration
3. Restart your application

## Additional Notes

- The file storage service has been updated to use Azure Blob Storage
- The Prisma schema and client have been configured for Azure Database
- All environment variables have been updated for Azure services
- The migration script in `scripts/migrate-to-azure.ts` can be used to verify your setup

## Next Steps

1. Complete the database migration using the steps above
2. Test all application functionality with the new Azure backend
3. Update your deployment configuration if using a hosting service
4. Monitor application performance and logs after migration