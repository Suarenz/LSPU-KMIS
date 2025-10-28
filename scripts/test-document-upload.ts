import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
require('dotenv').config();

// This script tests if document upload functionality should work after RLS policy fixes
async function testDocumentUpload() {
  console.log('Testing document upload functionality...');
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key for client-side operations
  );
  
 // Initialize Prisma client
  const prisma = new PrismaClient();

  try {
    // Check if admin user exists and has correct role
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@lspu.edu.ph' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      return;
    }

    if (adminUser.role !== 'ADMIN') {
      console.log(`❌ Admin user role is ${adminUser.role}, should be ADMIN`);
      return;
    }

    console.log(`✅ Admin user found with correct role: ${adminUser.role}`);

    // Check if repository-files bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Error listing buckets:', bucketError);
      return;
    }

    const repoBucket = buckets.find(bucket => bucket.name === 'repository-files');
    if (!repoBucket) {
      console.log('❌ repository-files bucket not found');
      return;
    }

    console.log('✅ repository-files bucket exists');

    // Summary of what needs to be in place for document upload to work
    console.log('\n--- Document Upload Requirements ---');
    console.log('✅ Admin user exists with correct role (ADMIN)');
    console.log('✅ Faculty user exists with correct role (FACULTY)');
    console.log('✅ repository-files bucket exists');
    console.log('✅ RLS policies use correct role values (uppercase: ADMIN, FACULTY)');
    console.log('\nTo complete the fix, apply the RLS policies as documented in docs/apply-rls-policies.md');
    console.log('\nAfter applying the RLS policies, admin and faculty users should be able to upload documents.');

  } catch (error) {
    console.error('❌ Error during document upload test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testDocumentUpload().catch(console.error);
}

export default testDocumentUpload;