import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import passwordService from '../lib/services/password-service';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in the database...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(` Role: ${user.role}`);
      console.log(`  Has Password: ${!!user.password}`);
      console.log('');
    });

    // Check if we need to create a test admin user
    const adminUser = users.find(user => user.email === 'admin@lspu.edu.ph');
    if (!adminUser || !adminUser.password) {
      console.log('Creating test admin user...');
      
      // Hash a default password
      const hashedPassword = await passwordService.hashPassword('admin123');
      
      const newUser = await prisma.user.upsert({
        where: { email: 'admin@lspu.edu.ph' },
        update: {
          password: hashedPassword,
        },
        create: {
          email: 'admin@lspu.edu.ph',
          name: 'Admin User',
          role: 'ADMIN',
          password: hashedPassword,
        }
      });
      
      console.log(`Created/updated admin user: ${newUser.email}`);
    } else {
      console.log('Admin user already exists with password');
    }

    // Check if we need to create a test faculty user
    const facultyUser = users.find(user => user.email === 'faculty@lspu.edu.ph');
    if (!facultyUser || !facultyUser.password) {
      console.log('Creating test faculty user...');
      
      // Hash a default password
      const hashedPassword = await passwordService.hashPassword('faculty123');
      
      const newUser = await prisma.user.upsert({
        where: { email: 'faculty@lspu.edu.ph' },
        update: {
          password: hashedPassword,
        },
        create: {
          email: 'faculty@lspu.edu.ph',
          name: 'Faculty User',
          role: 'FACULTY',
          password: hashedPassword,
        }
      });
      
      console.log(`Created/updated faculty user: ${newUser.email}`);
    } else {
      console.log('Faculty user already exists with password');
    }

    console.log('\nUser check completed successfully!');
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();