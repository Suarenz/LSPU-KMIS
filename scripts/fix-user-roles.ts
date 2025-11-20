import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function fixUserRoles() {
  try {
    console.log('Fixing user roles in the database...\n');

    // Get all users to check their current roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log('');
    });

    // Define the correct roles for default users
    const defaultUsers: Array<{ email: string; expectedRole: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL' }> = [
      { email: 'admin@lspu.edu.ph', expectedRole: 'ADMIN' },
      { email: 'faculty@lspu.edu.ph', expectedRole: 'FACULTY' },
      { email: 'student@lspu.edu.ph', expectedRole: 'STUDENT' },
      { email: 'external@partner.com', expectedRole: 'EXTERNAL' },
    ];

    // Fix roles for default users
    for (const user of defaultUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        if (existingUser.role !== user.expectedRole) {
          console.log(`Updating role for ${user.email} from ${existingUser.role} to ${user.expectedRole}`);
          
          await prisma.user.update({
            where: { email: user.email },
            data: { role: user.expectedRole },
          });
          
          console.log(`✓ Role updated for ${user.email}`);
        } else {
          console.log(`✓ Role is correct for ${user.email}: ${existingUser.role}`);
        }
      } else {
        console.log(`- Creating default user: ${user.email} with role ${user.expectedRole}`);
        
        // Create the default user if it doesn't exist
        const passwordService = await import('../lib/services/password-service');
        const hashedPassword = await passwordService.default.hashPassword('default123'); // Default password
        
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.email.includes('admin') ? 'Admin User' :
                  user.email.includes('faculty') ? 'Faculty User' :
                  user.email.includes('student') ? 'Student User' : 'External User',
            role: user.expectedRole,
            password: hashedPassword,
          }
        });
        
        console.log(`✓ Created user ${user.email} with role ${user.expectedRole}`);
      }
    }

    // Check for any admin users that might have been assigned the wrong role
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'admin' } },
          { name: { contains: 'Admin' } },
          { name: { contains: 'admin' } }
        ]
      }
    });

    for (const user of adminUsers) {
      if (user.role !== 'ADMIN') {
        console.log(`Found user ${user.email} with name ${user.name} that should be ADMIN but has role ${user.role}`);
        console.log(`Updating role to ADMIN...`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
        
        console.log(`✓ Updated ${user.email} role to ADMIN`);
      }
    }

    // Check for any faculty users that might have been assigned the wrong role
    const facultyUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'faculty' } },
          { email: { contains: 'prof' } },
          { name: { contains: 'Faculty' } },
          { name: { contains: 'Prof' } },
          { name: { contains: 'Dr.' } }
        ]
      }
    });

    for (const user of facultyUsers) {
      if (user.role !== 'FACULTY') {
        console.log(`Found user ${user.email} with name ${user.name} that should be FACULTY but has role ${user.role}`);
        console.log(`Updating role to FACULTY...`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'FACULTY' },
        });
        
        console.log(`✓ Updated ${user.email} role to FACULTY`);
      }
    }

    console.log('\nUser roles have been fixed successfully!');
    
    // Show final user list
    const updatedUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    console.log('\nFinal user list:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role}`);
    });

  } catch (error) {
    console.error('Error fixing user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  fixUserRoles().catch(console.error);
}

export default fixUserRoles;