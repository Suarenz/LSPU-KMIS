-- CreateTable
-- This migration adds the password column to the users table
ALTER TABLE "users" ADD COLUMN "password" TEXT;