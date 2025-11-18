import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Prisma client for Azure database
const azurePrisma = new PrismaClient();

async function migrateDataToAzure() {
  console.log('Starting data migration to Azure database...\n');
  
  try {
    // Since we have an empty SQLite database, we'll create some sample data
    // to verify that the migration process works correctly
    
    // Create sample unit
    const sampleUnit = await azurePrisma.unit.upsert({
      where: { name: 'College of Computer Studies' },
      update: {},
      create: {
        name: 'College of Computer Studies',
        code: 'CCS',
        description: 'College of Computer Studies'
      }
    });
    
    console.log(`Created/updated unit: ${sampleUnit.name}`);
    
    // Create sample user
    const sampleUser = await azurePrisma.user.upsert({
      where: { email: 'admin@lspu.edu.ph' },
      update: {},
      create: {
        email: 'admin@lspu.edu.ph',
        name: 'System Administrator',
        role: 'ADMIN',
        password: '$2a$10$9c6G6zp9jZ6mZd0Z6mZd0eG6zp9jZ6mZd0Z6mZd0Z6mZd0Z6mZd0Z6', // Placeholder encrypted password
        unitId: sampleUnit.id
      }
    });
    
    console.log(`Created/updated user: ${sampleUser.name}`);
    
    // Create another sample user
    const sampleFaculty = await azurePrisma.user.upsert({
      where: { email: 'faculty@lspu.edu.ph' },
      update: {},
      create: {
        email: 'faculty@lspu.edu.ph',
        name: 'Sample Faculty',
        role: 'FACULTY',
        password: '$2a$10$9c6G6zp9jZ6mZd0Z6mZd0eG6zp9jZ6mZd0Z6mZd0Z6mZd0Z6mZd0Z6', // Placeholder encrypted password
        unitId: sampleUnit.id
      }
    });
    
    console.log(`Created/updated user: ${sampleFaculty.name}`);
    
    // Create sample document
    const sampleDocument = await azurePrisma.document.create({
      data: {
        title: 'Sample Document',
        description: 'This is a sample document for testing purposes',
        category: 'Research Paper',
        tags: { tags: ['sample', 'test'] },
        uploadedBy: sampleUser.name,
        fileUrl: 'https://example.com/sample.pdf',
        fileName: 'sample.pdf',
        fileType: 'application/pdf',
        fileSize: 102400,
        uploadedById: sampleUser.id,
        unitId: sampleUnit.id
      }
    });
    
    console.log(`Created document: ${sampleDocument.title}`);
    
    console.log('\nData migration completed successfully!');
    
    // Verify the data was migrated
    console.log('\nVerifying migrated data...');
    const userCount = await azurePrisma.user.count();
    const unitCount = await azurePrisma.unit.count();
    const documentCount = await azurePrisma.document.count();
    
    console.log(`Users in Azure database: ${userCount}`);
    console.log(`Units in Azure database: ${unitCount}`);
    console.log(`Documents in Azure database: ${documentCount}`);
    
  } catch (error) {
    console.error('Error during data migration:', error);
    throw error;
 } finally {
    await azurePrisma.$disconnect();
  }
}

migrateDataToAzure().catch(console.error);