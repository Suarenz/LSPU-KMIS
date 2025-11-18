import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function updateUserPasswords() {
  try {
    console.log('Updating user passwords...\n');

    // Hash the new passwords
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '12');
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const facultyPassword = await bcrypt.hash('faculty123', saltRounds);

    // Update the admin user's password
    const adminUser = await prisma.user.update({
      where: { email: 'admin@lspu.edu.ph' },
      data: {
        password: adminPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    console.log(`Updated admin user: ${adminUser.email}`);
    console.log('Password set to: admin123\n');

    // Update the faculty user's password
    const facultyUser = await prisma.user.update({
      where: { email: 'faculty@lspu.edu.ph' },
      data: {
        password: facultyPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    console.log(`Updated faculty user: ${facultyUser.email}`);
    console.log('Password set to: faculty123\n');

    console.log('Password update completed successfully!');
    console.log('\nYou can now log in with:');
    console.log('Admin: admin@lspu.edu.ph / admin123');
    console.log('Faculty: faculty@lspu.edu.ph / faculty123');
  } catch (error) {
    console.error('Error updating user passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPasswords();