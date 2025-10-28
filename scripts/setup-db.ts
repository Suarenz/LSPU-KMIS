import { execSync } from 'child_process';

console.log('Setting up the LSPU KMIS database and Prisma client...');

try {
  // Install dependencies first
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push the schema to the database
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Database setup failed:', error);
  process.exit(1);
}