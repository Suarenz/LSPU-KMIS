# Database Configuration Guide

## Azure Database Connection Setup

This application uses Azure Database for PostgreSQL as the database provider with Prisma ORM for database operations. Proper configuration is essential for the application to work correctly.

### Environment Variables

You need to properly configure the following environment variables in your `.env` file:

```env
# Azure Database Configuration
DATABASE_URL="postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Direct connection to the database (used for migrations)
DIRECT_URL="postgresql://lspuadmin:laguna@123@lspu-kmis-db.postgres.database.azure.com:5432/postgres"
```

### Database Connection Types

The application uses two different connection strings for different purposes:

1. **DATABASE_URL**: Used for application database operations (with connection pooling for serverless environments)
2. **DIRECT_URL**: Used for Prisma migrations and direct database access

### Troubleshooting Database Connection Issues

If you encounter database connection errors:

1. **Verify your credentials**: Make sure the password in your connection string is correct
2. **Check server name**: Ensure your Azure Database server name matches in the URLs
3. **Network access**: Verify that your network/firewall allows connections to Azure Database
4. **SSL settings**: Ensure SSL mode is set to 'require' for Azure connections

### Common Error Messages

- **"Authentication failed against database server"**: This usually indicates incorrect username/password in your connection string
- **"Connection timeout"**: This may indicate network issues or firewall restrictions
- **"SSL connection required"**: This indicates SSL is not properly configured in the connection string

### Testing Database Connection

You can test your database connection using the provided script:

```bash
npx tsx scripts/test-database-connection.ts
```

### Database Security Best Practices

For secure database operations:
- Use proper role-based access controls through the application layer
- Implement server-side validation for all database operations
- Keep database operations as simple as possible while maintaining security

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