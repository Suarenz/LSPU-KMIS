import { PrismaClient } from '@prisma/client';

async function testConnection() {
  console.log('Testing database connection...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database!');
    
    // Test by querying the user table
    const userCount = await prisma.user.count();
    console.log(`✅ Database connection verified. Found ${userCount} users in the database.`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Provide specific guidance based on error type
    if (error instanceof Error) {
      if (error.message.includes('P1001')) {
        console.log('\n💡 Error P1001: Can\'t reach database server');
        console.log('   - Check if your IP address is allowed in Azure firewall rules');
        console.log('   - Verify the server name, port, and credentials');
        console.log('   - Ensure "Allow access to Azure services" is enabled in Azure');
      } else if (error.message.includes('P1000')) {
        console.log('\n💡 Error P1000: Authentication failed');
        console.log('   - Verify your database credentials (username/password)');
        console.log('   - Check if your connection string is properly formatted');
      }
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
 .then(success => {
    if (success) {
      console.log('\n🎉 Database connection test passed!');
      process.exit(0);
    } else {
      console.log('\n💥 Database connection test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during connection test:', error);
    process.exit(1);
  });