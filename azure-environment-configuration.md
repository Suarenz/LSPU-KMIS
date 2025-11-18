# Azure Environment Configuration for LSPU KMIS

## Overview

This document provides detailed instructions for configuring the environment variables and settings required to connect the LSPU KMIS application to Azure Database for PostgreSQL and Azure Blob Storage.

## Prerequisites

Before configuring the environment, ensure you have:

1. **Azure Subscription** with appropriate permissions to create resources
2. **Azure Database for PostgreSQL** instance created
3. **Azure Storage Account** with Blob Storage created
4. **Azure CLI** installed and authenticated
5. **pg_dump and psql** utilities installed for database operations
6. **Node.js and npm** for dependency management

## Azure Database Configuration

### Database Connection Details

You'll need the following information from your Azure Database for PostgreSQL instance:

- **Server Name**: `lspu-kmis-db.postgres.database.azure.com`
- **Port**: `5432`
- **Admin Username**: `lspuadmin` (or as configured)
- **Database Name**: `postgres` (default) or your custom database name
- **Admin Password**: The password you set during database creation

### SSL Configuration

Azure Database for PostgreSQL requires SSL connections. The connection string must include `sslmode=require` to enforce SSL encryption.

## Environment Variables Configuration

### Complete .env File Template

Create or update your `.env.local` file with the following configuration:

```env
# Azure Database for PostgreSQL
# Replace <your_actual_password> with your actual Azure database password
DATABASE_URL="postgresql://lspuadmin:<your_actual_password>@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Direct connection to the database (used for migrations)
# Replace <your_actual_password> with your actual Azure database password
DIRECT_URL="postgresql://lspuadmin:<your_actual_password>@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Azure Blob Storage
# Replace <your_connection_string> with your actual Azure storage connection string
AZURE_STORAGE_CONNECTION_STRING="<your_connection_string>"
AZURE_STORAGE_ACCOUNT_NAME="lspukmisstorage"
AZURE_STORAGE_CONTAINER_NAME="repository-files"

# JWT Configuration
# Keep the existing JWT secret or generate a new one if needed
JWT_SECRET="6dFk5d0vbyLnZC0Amy83LtI47DsNr/KB4M+FgbUc6njd4cjk7XB2/8nTuhQDWW8OOgQ6fI74huxJE3a/RP2giw=="
JWT_EXPIRES_IN="24h"

# File Upload Configuration
MAX_FILE_SIZE=52428800 # 50MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"

# Remove or comment out Supabase variables (if they exist)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### Environment Variables Explained

#### Database Variables
- **DATABASE_URL**: Connection string for application database operations with connection pooling
- **DIRECT_URL**: Direct connection string for Prisma migrations and direct database access

#### Azure Storage Variables
- **AZURE_STORAGE_CONNECTION_STRING**: Complete connection string for Azure Blob Storage access
- **AZURE_STORAGE_ACCOUNT_NAME**: Name of your Azure Storage account
- **AZURE_STORAGE_CONTAINER_NAME**: Name of the blob container for document storage

#### Security Variables
- **JWT_SECRET**: Secret key for JWT token generation and verification
- **JWT_EXPIRES_IN**: Token expiration time

#### Application Variables
- **MAX_FILE_SIZE**: Maximum allowed file size in bytes
- **ALLOWED_FILE_TYPES**: Comma-separated list of allowed file extensions
- **NEXTAUTH_URL**: Base URL for the application

## Azure Storage Configuration

### Getting Azure Storage Connection String

To obtain your Azure Storage connection string:

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account
3. Go to "Access keys" under "Settings"
4. Copy the "Connection string" for key1 or key2

### Creating the Blob Container

If you haven't already created the blob container, use the Azure CLI:

```bash
az storage container create \
  --name repository-files \
  --account-name lspukmisstorage \
  --auth-mode login
```

## Prisma Configuration

### Schema File Setup

The `prisma/schema.prisma` file is already configured correctly:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Prisma Commands for Azure

After configuring environment variables, run these commands to set up Prisma for Azure:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Azure database
npx prisma db push

# Or deploy migrations (alternative approach)
npx prisma migrate deploy
```

## Testing Database Connection

### Using Prisma
```bash
# Test connection
npx prisma db pull --schema prisma/schema.prisma

# View database schema
npx prisma db pull
```

### Using psql Directly
```bash
# Test direct connection
psql "postgresql://lspuadmin:your_password@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

## Security Best Practices

### Database Security
1. **Password Management**: Store database passwords securely and never commit them to version control
2. **SSL Connections**: Always use SSL connections with `sslmode=require`
3. **Firewall Rules**: Configure firewall rules to allow only necessary IP addresses
4. **Connection Pooling**: Use connection pooling for production applications

### Storage Security
1. **Connection String**: Never commit storage connection strings to version control
2. **Container Access**: Set blob container access level to "Private" for security
3. **CORS Configuration**: Configure CORS rules to allow only your application domains

### Environment Management
1. **Separate Environments**: Use different environment files for development, staging, and production
2. **Variable Validation**: Validate environment variables before application startup
3. **Access Control**: Restrict access to environment files to authorized personnel only

## Troubleshooting Common Issues

### Database Connection Issues
- **Error**: `P1001: Can't reach database server`
  - Verify your database password in connection string
 - Check that your IP address is allowed in firewall rules
  - Ensure SSL mode is set to `require` in connection string

### Storage Connection Issues
- **Error**: `Authentication failed`
  - Verify your Azure Storage connection string is correct
  - Check that the storage account name matches your connection string
  - Ensure the blob container exists and has appropriate permissions

### Application Startup Issues
- **Error**: Environment variables not found
  - Verify your `.env.local` file is in the correct location
  - Check that environment variable names match exactly
  - Ensure the application is restarted after environment changes

## Migration Preparation Checklist

Before proceeding with the database migration, verify the following:

- [ ] Azure Database for PostgreSQL instance is created and running
- [ ] Azure Storage Account with Blob Storage is created
- [ ] Database firewall allows connections from your IP
- [ ] Required extensions (uuid-ossp, pgcrypto) are enabled
- [ ] Environment variables are properly configured
- [ ] Prisma client is generated successfully
- [ ] Database connection test passes
- [ ] Storage connection test passes
- [ ] Application starts without errors