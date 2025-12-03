import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Define the user roles type to match Prisma schema
type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL';

async function createDefaultUsers() {
 const defaultUsers: Array<{
    email: string;
    name: string;
    role: UserRole;
    password: string;
  }> = [
    {
      email: 'admin@lspu.edu.ph',
      name: 'Admin User',
      role: 'ADMIN',
      password: 'admin123',
    },
    {
      email: 'faculty@lspu.edu.ph',
      name: 'Faculty User',
      role: 'FACULTY',
      password: 'faculty123',
    },
    {
      email: 'student@lspu.edu.ph',
      name: 'Student User',
      role: 'STUDENT',
      password: 'student123',
    },
    {
      email: 'external@partner.com',
      name: 'External Collaborator',
      role: 'EXTERNAL',
      password: 'external123',
    },
  ];

  for (const userData of defaultUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`User with email ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          password: hashedPassword,
        },
      });

      console.log(`Created user: ${userData.name} (${userData.role}) with email: ${userData.email}`);
    } catch (error) {
      console.error(`Error creating user with email ${userData.email}:`, error);
    }
  }

 console.log('Default users creation process completed.');
}

async function main() {
  try {
    await createDefaultUsers();
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);