import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script tests both the Prisma (PostgreSQL) and Supabase database connections
async function testDatabaseConnection() {
  console.log('Testing database connections...\n');
  
  // Test Prisma/PostgreSQL connection
  console.log('1. Testing Prisma/PostgreSQL connection...');
  const prisma = new PrismaClient();
  
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('✓ Prisma/PostgreSQL connection successful');
    
    // Test by querying the users table
    const userCount = await prisma.user.count();
    console.log(`✓ Users table accessible, total users: ${userCount}`);
    
    // Get a few sample users to verify data is accessible
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });
    
    console.log('Sample users from database:');
    sampleUsers.forEach(user => {
      console.log(`  - ${user.email} | Role: ${user.role} | ID: ${user.id}`);
    });
    
  } catch (error) {
    console.error('✗ Prisma/PostgreSQL connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n2. Testing Supabase connection...');
  
  // Test Supabase connection
 try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Test by attempting to list users (this requires proper permissions)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError && userError.message !== 'Auth session not found') {
      console.log(`⚠️  Supabase auth check: ${userError.message} (this is expected if not signed in)`);
    } else {
      console.log('✓ Supabase client initialized successfully');
    }
    
    // Test storage connection by checking buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log(`⚠️  Could not list storage buckets: ${bucketError.message} (this may be due to permissions)`);
    } else {
      console.log(`✓ Supabase storage connection successful, found ${buckets.length} buckets`);
      buckets.forEach(bucket => {
        console.log(`  - Bucket: ${bucket.name} (ID: ${bucket.id})`);
      });
    }
    
  } catch (error) {
    console.error('✗ Supabase connection failed:', error);
  }
  
  console.log('\n3. Environment Configuration Check...');
  
  // Check environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'DIRECT_URL', 
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  console.log('Environment variables status:');
  requiredEnvVars.forEach(varName => {
    const isSet = !!process.env[varName];
    const status = isSet ? '✓ SET' : '✗ MISSING';
    console.log(`  ${status} ${varName}: ${isSet ? '...' + process.env[varName]!.slice(-10) : 'NOT SET'}`);
  });
  
  console.log('\n4. Connection Test Summary:');
  console.log('✓ Prisma/PostgreSQL connection test completed');
  console.log('✓ Supabase connection test completed');
  console.log('✓ Environment variables check completed');
  
  console.log('\nIf you encountered connection errors:');
  console.log('- Verify your DATABASE_URL in .env is correct');
  console.log('- Ensure your database server is running');
  console.log('- Check firewall settings if connecting to remote database');
  console.log('- Confirm Supabase project credentials are correct');
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testDatabaseConnection().catch(console.error);
}

export default testDatabaseConnection;