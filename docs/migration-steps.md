# Supabase Authentication Migration - Complete Steps

This document outlines all the steps needed to complete the Supabase authentication migration.

## Prerequisites

1. **Install PostgreSQL** (if not already installed):
   - Download from https://www.postgresql.org/download/
   - Make sure PostgreSQL service is running
   - Note your username (typically 'postgres') and password

2. **Install required packages** (if not already installed):
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

## Step 1: Database Setup

### Option A: Using Local PostgreSQL (Recommended for Development)

1. **Start your PostgreSQL service**:
   - On Windows: Start PostgreSQL service from Services
   - On macOS/Linux: Run `brew services start postgresql` or `sudo systemctl start postgresql`

2. **Create the database**:
   ```sql
   -- Connect to PostgreSQL as superuser
   psql -U postgres
   
   -- Create the database
   CREATE DATABASE lspu_kmis;
   
   -- Create a user (optional, for security)
   CREATE USER lspu_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE lspu_kmis TO lspu_user;
   
   -- Exit psql
   \q
   ```

3. **Update environment variables in `.env`**:
   ```env
   # Database (for local development)
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/lspu_kmis"
   DIRECT_URL="postgresql://postgres:your_password@localhost:5432/lspu_kmis"
   ```

### Option B: Using Supabase Database (For Production)

1. **Get your Supabase connection details**:
   - Go to your Supabase Dashboard
   - Navigate to Project Settings → Database
   - Copy the connection string details

2. **Update environment variables in `.env`**:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   
   # Database (for production with Supabase)
   DATABASE_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres"
   ```

## Step 2: Run Database Migration

1. **Run Prisma migration**:
   ```bash
   npx prisma migrate dev --name add_supabase_auth_id_to_users
   ```

2. **If you encounter issues with migrate, try db push**:
   ```bash
   npx prisma db push
   ```

3. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

## Step 3: User Migration

1. **Prepare your Supabase project**:
   - Enable email authentication in Supabase Dashboard
   - Configure email templates if needed
   - Get your Service Role Key from Project Settings → API

2. **Add Service Role Key to environment variables**:
    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
    SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
    ```
    
    Make sure to replace the placeholder values with your actual Supabase project credentials.

3. **Run the user migration script**:
    ```bash
    npx tsx scripts/migrate-users-to-supabase.ts
    ```
    
    Note: We use `tsx` instead of `ts-node` for better ES module support.

## Step 4: Verification

1. **Test the application**:
   - Start your Next.js application: `npm run dev`
   - Try logging in with existing user credentials
   - Verify that user roles are preserved
   - Test document upload/download permissions

2. **Check the database**:
   - Verify that the `users` table has the `supabase_auth_id` column
   - Confirm that existing users have been linked to Supabase Auth IDs

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Verify PostgreSQL service is running
   - Check your connection string format
   - Ensure the database exists

2. **Migration Fails**:
   - Check that the database is empty or compatible
   - Verify you have the correct permissions
   - Try `npx prisma migrate reset` (this will delete all data)

3. **User Migration Issues**:
   - Ensure Service Role Key has proper permissions
   - Check that the users table exists and has data
   - Verify that the `supabase_auth_id` column was added successfully

### For Production Deployment:

1. **Environment Variables**:
   - Set up all required environment variables in your deployment platform
   - Never commit sensitive keys to version control

2. **Run Production Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Security**:
   - Set up Row Level Security (RLS) policies in Supabase
   - Configure proper authentication settings
   - Test all security measures before going live

## Rollback Plan

If you need to revert to the old authentication system:

1. **Revert environment variables** to old configuration
2. **Revert the code changes** made during migration
3. **Restore from database backup** if needed
4. **Deploy the reverted application**

## Next Steps

After successful migration:

1. **Set up Row Level Security (RLS)** in Supabase for enhanced security
2. **Configure email templates** for password reset and verification
3. **Set up social authentication** if needed
4. **Monitor authentication metrics** and logs
5. **Plan for user communication** about any changes they might experience

## Troubleshooting Login Issues

If you're experiencing "invalid login credentials" after migration, this could be due to one of two issues: missing users in Supabase Auth or incorrect passwords. Follow these steps to resolve the issue:

### Step 1: Create Default Users in Supabase Auth
If the users don't exist in Supabase Auth, run the following script to create them and link them to your database records:

```bash
npx tsx scripts/create-default-users.ts
```

This will create the default user accounts (admin, faculty, student, external) in Supabase Auth with their original passwords and link them to your application database records.

### Step 2: Verify Users Were Created
After running the create users script, you can verify that the users exist by running the check script (though it may not show output if there are no issues):

```bash
npx tsx scripts/check-users-in-supabase.ts
```

### Step 3: Reset Passwords (if needed)
If the users exist but you're still having login issues, you can reset the default user passwords to their original values (this is only needed if the passwords were changed for some reason):

```bash
# Reset default user passwords (admin, faculty, student, external)
npx tsx scripts/reset-default-user-passwords.ts
```

This will reset the passwords to their original values (admin123, faculty123, etc.) as used in the development version of the application.