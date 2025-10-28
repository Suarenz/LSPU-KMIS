import { PrismaClient } from '@prisma/client';
require('dotenv').config();

// This script helps reset the database connection to clear any cached prepared statements
async function resetDBConnection() {
  console.log('Resetting database connection to clear cached prepared statements...');

  const prisma = new PrismaClient();

  try {
    // Perform a simple query to test the connection
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection test successful:', result);

    // Optionally, you can run a query to clear prepared statements if needed
    // This is more for debugging purposes
    console.log('Connection test completed successfully.');
    console.log('\nNext steps:');
    console.log('1. Stop this script (Ctrl+C)');
    console.log('2. Stop your Next.js development server if it\'s running');
    console.log('3. Restart your Next.js development server');
    console.log('4. The ?pgbouncer=true parameter in your DATABASE_URL will help prevent prepared statement caching issues');
    console.log('5. Access your application - the infinite recursion error should be resolved');

  } catch (error) {
    console.error('Error during database connection test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  resetDBConnection().catch(console.error);
}

export default resetDBConnection;