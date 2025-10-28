# Database Configuration Guide

## Supabase Database Connection Setup

This application uses Supabase as the database provider with Prisma ORM for database operations. Proper configuration is essential for the application to work correctly.

### Environment Variables

You need to properly configure the following environment variables in your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (for Prisma - use connection pooling string for serverless)
# For development, use local database; for production, use Supabase connection

# Connect to Supabase via connection pooling (for serverless environments)
DATABASE_URL="postgresql://postgres.your-project-id:[your-actual-password]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

# Direct connection to the database (used for migrations)
DIRECT_URL="postgresql://postgres:[your-actual-password]@db.your-project-id.supabase.co:5432/postgres"
```

### Database Connection Types

The application uses two different connection strings for different purposes:

1. **DATABASE_URL**: Used for application database operations (with connection pooling for serverless environments)
2. **DIRECT_URL**: Used for Prisma migrations and direct database access

### Troubleshooting Database Connection Issues

If you encounter database connection errors:

1. **Verify your credentials**: Make sure the password in your connection string is correct
2. **Check project ID**: Ensure your Supabase project ID matches in the URLs
3. **Network access**: Verify that your network/firewall allows connections to Supabase
4. **Database region**: Ensure the region in your connection string matches your Supabase project region

### Common Error Messages

- **"Authentication failed against database server"**: This usually indicates incorrect username/password in your connection string
- **"infinite recursion detected in policy"**: This indicates a circular reference in your Row Level Security (RLS) policies
- **"Connection timeout"**: This may indicate network issues or firewall restrictions

### Testing Database Connection

You can test your database connection using the provided script:

```bash
npx tsx scripts/test-database-connection.ts
```

### RLS Policy Best Practices

To avoid infinite recursion in RLS policies:
- Avoid querying the same table from within its own policy
- Use JWT claims for admin checks instead of querying the users table
- Keep policies as simple as possible while maintaining security

### Migration Commands

For database migrations, make sure to use the DIRECT_URL:

```bash
# To apply migrations
npx prisma migrate dev

# To reset the database
npx prisma migrate reset
```

### Security Considerations

- Never commit actual database passwords to version control
- Use different database credentials for development and production
- Regularly rotate your database passwords and API keys
- Monitor database access logs for unusual activity