import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('LSPU KMIS - Database Migration to Azure');

async function checkEnvironmentVariables() {
  console.log('\n1. Checking environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'AZURE_STORAGE_CONNECTION_STRING',
    'AZURE_STORAGE_ACCOUNT_NAME',
    'AZURE_STORAGE_CONTAINER_NAME'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('\nPlease update your .env file with the following:');
    console.log('- DATABASE_URL with your Azure database connection string');
    console.log('- DIRECT_URL with your Azure database connection string');
    console.log('- AZURE_STORAGE_CONNECTION_STRING with your Azure storage connection string');
    console.log('- AZURE_STORAGE_ACCOUNT_NAME with your Azure storage account name');
    console.log('- AZURE_STORAGE_CONTAINER_NAME with your Azure storage container name');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

async function testDatabaseConnection() {
  console.log('\n2. Testing database connection...');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma db pull');
    if (stderr) {
      console.error('❌ Database connection test failed:', stderr);
      process.exit(1);
    }
    console.log('✅ Database connection successful');
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error.message);
    console.log('\nMake sure:');
    console.log('- Your Azure database server is running');
    console.log('- Your connection string is correct');
    console.log('- Your username and password are correct');
    console.log('- Your IP address is allowed in the firewall rules');
    process.exit(1);
  }
}

async function generatePrismaClient() {
  console.log('\n3. Generating Prisma client...');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma generate');
    if (stderr) {
      console.error('❌ Prisma client generation failed:', stderr);
      process.exit(1);
    }
    console.log('✅ Prisma client generated successfully');
  } catch (error: any) {
    console.error('❌ Prisma client generation failed:', error.message);
    process.exit(1);
  }
}

async function deploySchema() {
  console.log('\n4. Deploying schema to Azure database...');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma db push');
    if (stderr) {
      console.error('❌ Schema deployment failed:', stderr);
      process.exit(1);
    }
    console.log('✅ Schema deployed successfully');
  } catch (error: any) {
    console.error('❌ Schema deployment failed:', error.message);
    console.log('\nIf you get authentication errors, make sure to replace <your_actual_password> in your .env file with your real Azure database password.');
    process.exit(1);
  }
}

async function runMigrations() {
  console.log('\n5. Running Prisma migrations...');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma migrate dev --name azure-migration');
    if (stderr) {
      console.error('❌ Migrations failed:', stderr);
      process.exit(1);
    }
    console.log('✅ Migrations completed successfully');
  } catch (error: any) {
    console.error('❌ Migrations failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('Starting migration process...');
  
  await checkEnvironmentVariables();
  await testDatabaseConnection();
  await generatePrismaClient();
  await deploySchema();
  // Note: We're not running runMigrations() by default as it might conflict with db push
  // Uncomment the line below if you want to run migrations instead of db push
  // await runMigrations();
  
  console.log('\n🎉 Migration setup completed!');
  console.log('\nNext steps:');
  console.log('1. Create a backup of your Supabase database:');
  console.log('   pg_dump "your_supabase_connection_string" > lspu-kmis-supabase-backup.sql');
  console.log('\n2. Import the backup to your Azure database:');
  console.log('   psql "your_azure_connection_string" < lspu-kmis-supabase-backup.sql');
  console.log('\n3. Test your application with the new Azure database');
  console.log('\n4. Update the file-storage-service.ts with your actual Azure storage connection string');
}

main().catch(error => {
  console.error('Migration process failed:', error);
  process.exit(1);
});