# Database Connection Troubleshooting Guide

## Error: P1001: Can't reach database server

This document explains the common causes of the Prisma error `P1001: Can't reach database server` and provides solutions for fixing it, particularly in the context of a Supabase connection.

## Root Cause Analysis

The error `P1001: Can't reach database server at db.mydcfacggxluyljslcbp.supabase.co:5432` typically occurs due to one of the following issues:

1. **Incorrect database password in connection string**
2. **Network connectivity issues**
3. **Firewall restrictions**
4. **Invalid project ID in connection string**

## Solution: Fix Database Connection Strings

### 1. Update Your .env File

The database connection strings in your `.env` file need to be properly formatted with the correct password. The current format should be:

```env
# Database (for Prisma - use connection pooling string for serverless)
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[YOUR-DB-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# Direct connection to the database (used for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[YOUR-DB-PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
```

### 2. How to Get Your Database Password

You can retrieve your actual database password from the Supabase Dashboard:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Project Settings" → "Database"
4. Look for "Connection string" section
5. Use the password from the connection string

Alternatively, you can use the Supabase CLI to get the connection details:

```bash
# First, login to Supabase CLI
supabase login

# Then link your project (replace with your actual project ref)
supabase link --project-ref [YOUR-PROJECT-REF]
```

### 3. Example of Corrected .env File

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mydcfacggxluyljslcbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZGNmYWNnZ3hsdXlsanNsY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjg3NjgsImV4cCI6MjA3NjcwNDc2OH0.P-7fhrK3yx71oxOi8onilmt29PKygQYZ9pVqAxEw8Zk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZGNmYWNnZ3hsdXlsanNsY2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTEyODc2OCwiZXhwIjoyMDc2NzA0NzY4fQ.XEZ4cNh9cloahJr7h0u0RwayduWvSigr1PLECKItgNQ

# Database (for Prisma - use connection pooling string for serverless)
DATABASE_URL="postgresql://postgres.mydcfacggxluyljslcbp:[YOUR-DB-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# Direct connection to the database (used for migrations)
DIRECT_URL="postgresql://postgres.mydcfacggxluyljslcbp:[YOUR-DB-PASSWORD]@db.mydcfacggxluyljslcbp.supabase.co:5432/postgres"

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

1. **Check Network Connectivity**: Ensure your network allows connections to Supabase
2. **Verify Project ID**: Make sure the project ID in your connection string matches your actual Supabase project
3. **Check Firewall**: Some networks or corporate firewalls may block connections to external databases
4. **Validate Credentials**: Double-check that your database password is correct
5. **Try Direct Connection**: Temporarily use DIRECT_URL for operations to see if the issue is with connection pooling
6. **Check Supabase Database Status**: Verify that your Supabase project database is active and not paused
7. **IP Restrictions**: Check if there are any IP restrictions on your Supabase project that might block your connection
8. **Try Different Connection Method**: If connection pooling doesn't work, try using the direct connection (without pooler) for migrations

## Testing Direct Connection vs Pooling

If you're still having issues, try testing with the direct connection first:

```bash
# Test with direct connection only
export DATABASE_URL="postgresql://postgres.mydcfacggxluyljslcbp:[YOUR-DB-PASSWORD]@db.mydcfacggxluyljslcbp.supabase.co:5432/postgres"
npx prisma db pull
```

## Supabase-Specific Considerations

1. **Connection Pooling**: Supabase uses connection pooling which can sometimes cause issues with certain operations. The direct connection (using `db.*.supabase.co`) bypasses the pooler.

2. **Database Region**: Make sure the region in your connection string matches your Supabase project region. In this case, it's `aws-1-ap-south-1` which should match your project's region.

3. **Database Settings**: Check if your Supabase project has any specific settings that might affect connections.

## Alternative Connection Testing

You can also test your database connection directly using psql or another PostgreSQL client:

```bash
# Test connection with psql (if installed)
psql "postgresql://postgres.mydcfacggxluyljslcbp:[YOUR-DB-PASSWORD]@db.mydcfacggxluyljslcbp.supabase.co:5432/postgres"
```

## Security Best Practices

- Store your database password securely and never commit it to version control
- Use environment variables to store sensitive information
- Rotate your database password regularly
- Limit access to your database credentials to authorized personnel only