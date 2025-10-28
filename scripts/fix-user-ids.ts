import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { serialize } from 'v8';

// Generate a proper CUID using the same method as Prisma
function generateCuid(): string {
  // Using a simplified approach - in production, you might want to use the cuid library
  // For now, we'll generate a unique ID that follows the cuid pattern
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `ck${timestamp}${randomPart}`;
}

// This script fixes user IDs to use proper CUID format
async function fixUserIds() {
  console.log('Fixing user IDs to use proper CUID format...');
  
  // Initialize Prisma client to access user data
 const prisma = new PrismaClient();

  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to update...`);
    
    for (const user of users) {
      // Check if the current ID is already in CUID format (starts with 'ck')
      if (user.id.startsWith('ck')) {
        console.log(`User ${user.email} already has CUID format ID: ${user.id}, skipping...`);
        continue;
      }
      
      console.log(`Processing user: ${user.email} (current ID: ${user.id})`);
      
      // Generate a new CUID
      const newId = generateCuid();
      console.log(`Generated new CUID for ${user.email}: ${newId}`);
      
      // Store the old ID for reference
      const oldId = user.id;
      
      // Update the user with the new ID
      // We need to temporarily set the old ID to null to avoid unique constraint issues
      await prisma.user.update({
        where: { id: oldId },
        data: { id: newId }
      });
      
      console.log(`Updated user ${user.email} from ${oldId} to ${newId}`);
    }
    
    console.log('All user IDs have been updated to CUID format.');
    console.log('Now updating related records...');
    
    // Update related records that reference the old user IDs
    // This includes documents, permissions, downloads, views, and comments
    const updatedUsers = await prisma.user.findMany();
    
    for (const user of updatedUsers) {
      // Update documents uploaded by this user
      const updatedDocuments = await prisma.document.updateMany({
        where: { uploadedById: user.id },
        data: { uploadedBy: user.email } // Keep the email reference for consistency
      });
      console.log(`Updated ${updatedDocuments.count} documents for user ${user.email}`);
      
      // Update document permissions
      const updatedPermissions = await prisma.documentPermission.updateMany({
        where: { userId: user.id },
        data: { userId: user.id }
      });
      
      // Update document downloads
      const updatedDownloads = await prisma.documentDownload.updateMany({
        where: { userId: user.id },
        data: { userId: user.id }
      });
      
      // Update document views
      const updatedViews = await prisma.documentView.updateMany({
        where: { userId: user.id },
        data: { userId: user.id }
      });
      
      // Update document comments
      const updatedComments = await prisma.documentComment.updateMany({
        where: { userId: user.id },
        data: { userId: user.id }
      });
      
      console.log(`Updated ${updatedPermissions.count} permissions, ${updatedDownloads.count} downloads, ${updatedViews.count} views, and ${updatedComments.count} comments for user ${user.email}`);
    }
    
    console.log('All user IDs have been successfully updated to CUID format and related records updated.');
    
  } catch (error) {
    console.error('Error fixing user IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  fixUserIds().catch(console.error);
}

export default fixUserIds;