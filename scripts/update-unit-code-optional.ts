import { execSync } from 'child_process';

console.log('Updating Prisma schema to make unit code optional...');

try {
  // Generate the migration
  execSync('npx prisma migrate dev --name make-unit-code-optional', { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Error running migration:', error);
  process.exit(1);
}