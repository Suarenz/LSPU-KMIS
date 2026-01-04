import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ select: { id: true, email: true, role: true } });
  console.log('User:', user);
  await prisma.$disconnect();
}
main().catch(console.error);
