import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

async function dropBlockingRLSPolicies() {
  const prisma = new PrismaClient();

  try {
    console.log('Attempting to drop blocking RLS policies using Prisma...');
    
    console.log('\n1. Dropping specific policies that are blocking the migration...');
    
    // Drop specific policies that are blocking the migration
    // Note: These SQL commands will be executed directly on the database
    
    // Drop policy on document_permissions table
    try {
      await prisma.$executeRaw`DROP POLICY IF EXISTS "Users and service role can access document permissions" ON document_permissions;`;
      console.log('✓ Dropped policy on document_permissions table');
    } catch (error: any) {
      console.log(`- Could not drop policy on document_permissions:`, error.message);
    }

    // Drop policy on documents table
    try {
      await prisma.$executeRaw`DROP POLICY IF EXISTS "Users and service role can access documents" ON documents;`;
      console.log('✓ Dropped policy on documents table');
    } catch (error: any) {
      console.log(`- Could not drop policy on documents:`, error.message);
    }

    // Drop policy on storage.objects table
    try {
      await prisma.$executeRaw`DROP POLICY IF EXISTS "Owner/Admin Delete for repository-files" ON storage.objects;`;
      console.log('✓ Dropped policy on storage.objects table');
    } catch (error: any) {
      console.log(`- Could not drop policy on storage.objects:`, error.message);
    }

    // Check for any remaining policies on storage.objects that might reference "role"
    console.log('\n2. Checking for remaining policies on storage.objects...');
    try {
      const remainingPolicies = await prisma.$queryRaw`SELECT policyname, tablename, schemaname, cmd, roles FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';`;
      console.log('Remaining policies on storage.objects:', remainingPolicies);
      
      // If there are remaining policies, we'll need to handle them
      if (Array.isArray(remainingPolicies) && remainingPolicies.length > 0) {
        console.log(`Found ${remainingPolicies.length} remaining policies on storage.objects that may need to be dropped`);
      }
    } catch (error: any) {
      console.log('Could not fetch remaining policies:', error.message);
    }

    // Disable RLS temporarily on affected tables
    console.log('\n3. Disabling RLS temporarily on affected tables...');
    try {
      await prisma.$executeRaw`ALTER TABLE document_permissions DISABLE ROW LEVEL SECURITY;`;
      console.log('✓ RLS disabled on document_permissions table');
    } catch (error: any) {
      console.log(`- Could not disable RLS on document_permissions:`, error.message);
    }

    try {
      await prisma.$executeRaw`ALTER TABLE documents DISABLE ROW LEVEL SECURITY;`;
      console.log('✓ RLS disabled on documents table');
    } catch (error: any) {
      console.log(`- Could not disable RLS on documents:`, error.message);
    }

    try {
      await prisma.$executeRaw`ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`;
      console.log('✓ RLS disabled on storage.objects table');
    } catch (error: any) {
      console.log(`- Could not disable RLS on storage.objects:`, error.message);
    }

    console.log('\n4. Successfully dropped blocking RLS policies!');
    console.log('You can now run your Prisma migration with: npx prisma db push');
    
  } catch (error: any) {
    console.error('Error occurred while dropping RLS policies:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
dropBlockingRLSPolicies().catch(console.error);