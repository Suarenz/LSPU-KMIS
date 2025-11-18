-- Drop the unique index on supabase_auth_id
DROP INDEX IF EXISTS "users_supabase_auth_id_key";

-- Drop the supabase_auth_id column from the users table
ALTER TABLE "users" DROP COLUMN "supabase_auth_id";