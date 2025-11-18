# Database Connection Troubleshooting Guide

## Error: P1001: Can't reach database server

This document explains the common causes of the Prisma error `P1001: Can't reach database server` and provides solutions for fixing it, particularly in the context of an Azure Database connection.

## Root Cause Analysis

The error `P1001: Can't reach database server` typically occurs due to one of the following issues:

1. **Incorrect database password in connection string**
2. **Network connectivity issues**
3. **Firewall restrictions**
4. **Invalid project ID in connection string**

## Solution: Fix Database Connection Strings

### 1. Update Your .env File

The database connection strings in your `.env` file need to be properly formatted with the correct password. The current format should be:

```env
# Database (for Prisma - Azure connection)
DATABASE_URL="postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Direct connection to the database (used for migrations)
DIRECT_URL="postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres"
```

### 2. How to Get Your Database Password

You can retrieve your actual database password from the Azure Portal:

1. Go to your Azure portal
2. Select your PostgreSQL database resource
3. Navigate to "Connection strings" or "Settings" → "Database"
4. Look for "Connection string" section
5. Use the password from the connection string

Alternatively, you can use the Supabase CLI to get the connection details:

```bash
# For Azure Database, no special CLI is needed
# Connection is handled directly through the connection string
```

### 3. Example of Corrected .env File

```env
# Database (for Prisma - Azure connection)
DATABASE_URL="postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Direct connection to the database (used for migrations)
DIRECT_URL="postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres"

# JWT
JWT_SECRET="6dFk5d0vbyLnZC0Amy83LtI47DsNr/KB4M+FgbUc6njd4cjk7XB2/8nTuhQDWW8OOgQ6fI74huxJE3a/RP2giw=="
JWT_EXPIRES_IN="24h"

# File Upload
MAX_FILE_SIZE=52428800 # 50MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

## Testing the Database Connection

After updating your environment variables, you can test the database connection using the provided script:

```bash
npx tsx scripts/test-database-connection.ts
```

Or you can try the Prisma commands again:

```bash
npx prisma db pull
# or
npx prisma db push
```

## Additional Troubleshooting Steps

If you continue to experience connection issues:

1. **Check Network Connectivity**: Ensure your network allows connections to Azure Database
2. **Verify Server Name**: Make sure the server name in your connection string matches your actual Azure Database server
3. **Check Firewall**: Some networks or corporate firewalls may block connections to external databases
4. **Validate Credentials**: Double-check that your database password is correct
5. **Try Direct Connection**: Temporarily use DIRECT_URL for operations to see if the issue is with connection settings
6. **Check Azure Database Status**: Verify that your Azure Database resource is active and not paused
7. **IP Restrictions**: Check if there are any IP restrictions in your Azure Database firewall that might block your connection
8. **Try Different Connection Method**: If the connection doesn't work, try adjusting SSL settings in your connection string

## Testing Direct Connection vs Pooling

If you're still having issues, try testing with the direct connection first:

```bash
# Test with direct connection only
export DATABASE_URL="postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres"
npx prisma db pull
```

## Azure Database-Specific Considerations

1. **SSL Connection**: Azure Database for PostgreSQL requires SSL connections, which is why our connection strings include `sslmode=require`.

2. **Connection String Format**: Make sure your connection string follows the format `postgresql://username:password@server:port/database?sslmode=require`.

3. **Firewall Settings**: Check your Azure Database firewall settings to ensure your IP address or application is allowed to connect.

## Alternative Connection Testing

You can also test your database connection directly using psql or another PostgreSQL client:

```bash
# Test connection with psql (if installed)
psql "postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

## Security Best Practices

- Store your database password securely and never commit it to version control
- Use environment variables to store sensitive information
- Rotate your database password regularly
- Limit access to your database credentials to authorized personnel only