# Azure Migration Environment Configuration

## Database Connection Details

You've provided the following Azure Database for PostgreSQL connection details:
- Server: `lspu-kmis-db.postgres.database.azure.com`
- Port: `5432`
- Username: `lspuadmin`

## Environment Variables Configuration

Update your `.env.local` file with the following configuration:

```env
# Azure Database for PostgreSQL
DATABASE_URL="postgresql://lspuadmin:<your_password>@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://lspuadmin:<your_password>@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="your_connection_string"
AZURE_STORAGE_ACCOUNT_NAME="lspukmisstorage"
AZURE_STORAGE_CONTAINER_NAME="repository-files"

# Remove or comment out Supabase variables
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

Replace `<your_password>` with your actual Azure database password and `your_connection_string` with your Azure Storage connection string.

## Prisma Commands for Schema Deployment

After updating your environment variables, run the following commands to deploy your schema to Azure:

```bash
npx prisma generate
npx prisma db push
```

## Database Migration Commands

To migrate your data from Supabase to Azure:

1. Create a backup from Supabase:
   ```bash
   pg_dump "your_supabase_connection_string" > lspu-kmis-supabase-backup.sql
   ```

2. Import to Azure Database:
   ```bash
   psql "postgresql://lspuadmin:<your_password>@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require" < lspu-kmis-supabase-backup.sql
   ```

## Verification Steps

After migration, verify your data integrity by running:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM units;
SELECT COUNT(*) FROM document_permissions;
SELECT COUNT(*) FROM unit_permissions;