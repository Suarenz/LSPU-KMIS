import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('Checking current data in the database...\n');

    // Count records in each table
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);

    const unitCount = await prisma.unit.count();
    console.log(`Units: ${unitCount}`);

    const documentCount = await prisma.document.count();
    console.log(`Documents: ${documentCount}`);

    const documentPermissionCount = await prisma.documentPermission.count();
    console.log(`Document Permissions: ${documentPermissionCount}`);

    const unitPermissionCount = await prisma.unitPermission.count();
    console.log(`Unit Permissions: ${unitPermissionCount}`);

    const documentCommentCount = await prisma.documentComment.count();
    console.log(`Document Comments: ${documentCommentCount}`);

    const documentDownloadCount = await prisma.documentDownload.count();
    console.log(`Document Downloads: ${documentDownloadCount}`);

    const documentViewCount = await prisma.documentView.count();
    console.log(`Document Views: ${documentViewCount}`);

    console.log('\nData check completed successfully!');
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();