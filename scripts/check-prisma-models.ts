import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModels() {
  try {
    // Try to access the forumPost model
    console.log('Checking if forumPost model exists...');
    
    // This will fail if the model doesn't exist
    const count = await prisma.$queryRaw`SELECT COUNT(*) FROM "ForumPost"`;
    console.log('ForumPost table exists in database:', count);
  } catch (error) {
    console.error('Error checking ForumPost model:', error);
  }

  try {
    // Try to access the forumReply model
    console.log('Checking if forumReply model exists...');
    
    // This will fail if the model doesn't exist
    const count = await prisma.$queryRaw`SELECT COUNT(*) FROM "ForumReply"`;
    console.log('ForumReply table exists in database:', count);
  } catch (error) {
    console.error('Error checking ForumReply model:', error);
  }

  // Check available models via Prisma introspection
  console.log('Available models in Prisma client:');
  console.log('prisma.user exists:', typeof prisma.user !== 'undefined');
  console.log('prisma.document exists:', typeof prisma.document !== 'undefined');
  console.log('prisma.unit exists:', typeof prisma.unit !== 'undefined');
  
  // Using type assertion to handle TypeScript compilation issue
  // If you're getting TypeScript errors, run: npx prisma generate
  console.log('prisma.forumPost exists:', typeof (prisma as any).forumPost !== 'undefined');
  console.log('prisma.forumReply exists:', typeof (prisma as any).forumReply !== 'undefined');
  
  // More comprehensive check for forum models
  try {
    // Check if we can access the forumPost model at runtime
    const forumPostCount = await (prisma as any).forumPost.count();
    console.log(`ForumPost model accessible, total records: ${forumPostCount}`);
  } catch (error: any) {
    console.log('ForumPost model not accessible at runtime:', error.message);
  }
  
  try {
    // Check if we can access the forumReply model at runtime
    const forumReplyCount = await (prisma as any).forumReply.count();
    console.log(`ForumReply model accessible, total records: ${forumReplyCount}`);
  } catch (error: any) {
    console.log('ForumReply model not accessible at runtime:', error.message);
  }
  
  await prisma.$disconnect();
 }

checkModels().catch(console.error);