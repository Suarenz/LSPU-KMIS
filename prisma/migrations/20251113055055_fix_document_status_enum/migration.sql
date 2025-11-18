-- First, drop the default value constraint if it exists
ALTER TABLE "documents" ALTER COLUMN "status" DROP DEFAULT;

-- Update any existing TEXT values to ensure they match enum values
UPDATE "documents" SET "status" = 'ACTIVE' WHERE "status" NOT IN ('ACTIVE', 'ARCHIVED', 'PENDING_REVIEW');

-- Then, alter the column to use the DocumentStatus enum type
ALTER TABLE "documents" ALTER COLUMN "status" TYPE "DocumentStatus" USING
  CASE
    WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"DocumentStatus"
    WHEN "status" = 'ARCHIVED' THEN 'ARCHIVED'::"DocumentStatus"
    WHEN "status" = 'PENDING_REVIEW' THEN 'PENDING_REVIEW'::"DocumentStatus"
    ELSE 'ACTIVE'::"DocumentStatus"
  END;

-- Add the default value back
ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';