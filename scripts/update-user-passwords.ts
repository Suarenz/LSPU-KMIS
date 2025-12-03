import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateUserPasswords() {
  const usersToUpdate = [
    { email: 'admin@lspu.edu.ph', newPassword: 'admin123' },
    { email: 'faculty@lspu.edu.ph', newPassword: 'faculty123' },
    { email: 'student@lspu.edu.ph', newPassword: 'student123' },
    { email: 'external@partner.com', newPassword: 'external123' },
  ];

  for (const userData of usersToUpdate) {
    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(userData.newPassword, 10);

      // Update the user's password
      const updatedUser = await prisma.user.update({
        where: { email: userData.email },
        data: { password: hashedPassword },
      });

      console.log(`Updated password for user: ${userData.email}`);
    } catch (error) {
      console.error(`Error updating password for user ${userData.email}:`, error);
      // If user doesn't exist, you might want to create them
      try {
        const hashedPassword = await bcrypt.hash(userData.newPassword, 10);
        await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.email.split('@')[0].charAt(0).toUpperCase() + userData.email.split('@')[0].slice(1) + ' User',
            role: userData.email.includes('admin') ? 'ADMIN' : 
                  userData.email.includes('faculty') ? 'FACULTY' : 
                  userData.email.includes('student') ? 'STUDENT' : 'EXTERNAL',
            password: hashedPassword,
          },
        });
        console.log(`Created user: ${userData.email}`);
      } catch (createError) {
        console.error(`Could not create or update user ${userData.email}:`, createError);
      }
    }
  }

  console.log('Password update process completed.');
}

async function main() {
  try {
    await updateUserPasswords();
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);