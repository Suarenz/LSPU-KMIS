import { PrismaClient } from '@prisma/client';
require('dotenv').config();

// This script verifies the admin user and fixes any issues without changing primary keys
async function verifyAndFixAdmin() {
  console.log('Verifying and fixing admin user...');
  
  // Initialize Prisma client to access user data
  const prisma = new PrismaClient();

  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@lspu.edu.ph' }
    });

    if (!adminUser) {
      console.log('Admin user does not exist. Creating admin user...');
      
      // Create the admin user with a proper CUID
      const cuid = `ck${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
      
      const newAdminUser = await prisma.user.create({
        data: {
          id: cuid,
          email: 'admin@lspu.edu.ph',
          name: 'Admin User',
          role: 'ADMIN',
          department: 'IT Department'
        }
      });
      
      console.log(`Created new admin user with ID: ${newAdminUser.id} (CUID format: ${newAdminUser.id.startsWith('ck') ? 'Yes' : 'No'})`);
    } else {
      console.log(`Admin user found with ID: ${adminUser.id} (CUID format: ${adminUser.id.startsWith('ck') ? 'Yes' : 'No'})`);
      console.log(`Role: ${adminUser.role}`);
      
      // Check if the role is correct
      if (adminUser.role !== 'ADMIN') {
        console.log(`Updating admin user role from ${adminUser.role} to ADMIN...`);
        await prisma.user.update({
          where: { email: 'admin@lspu.edu.ph' },
          data: { role: 'ADMIN' }
        });
        console.log('Admin user role updated to ADMIN');
      }
      
      // If the ID is not in CUID format, log a warning but don't change it
      // as changing primary keys would break foreign key relationships
      if (!adminUser.id.startsWith('ck')) {
        console.log(`\n⚠️ WARNING: Admin user ID '${adminUser.id}' is not in CUID format`);
        console.log(`This ID was likely created differently than expected, but changing primary keys`);
        console.log(`would break foreign key relationships in the database.`);
        console.log(`The important thing is that the role is correct and the user exists.`);
      }
    }
    
    // Verify that all default users exist with correct roles
    const defaultUsers: Array<{ email: string; role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL'; name: string }> = [
      { email: 'admin@lspu.edu.ph', role: 'ADMIN', name: 'Admin User' },
      { email: 'faculty@lspu.edu.ph', role: 'FACULTY', name: 'Dr. Maria Santos' },
      { email: 'student@lspu.edu.ph', role: 'STUDENT', name: 'Juan Dela Cruz' },
      { email: 'external@partner.com', role: 'EXTERNAL', name: 'External Partner' }
    ];
    
    for (const userData of defaultUsers) {
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (!user) {
        console.log(`Creating missing default user: ${userData.email}`);
        const cuid = `ck${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
        
        await prisma.user.create({
          data: {
            id: cuid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            department: userData.role === 'ADMIN' ? 'IT Department' :
                      userData.role === 'FACULTY' ? 'Computer Science' :
                      userData.role === 'STUDENT' ? 'Computer Science' :
                      'Research Collaboration'
          }
        });
      } else {
        // Update role if needed
        if (user.role !== userData.role) {
          console.log(`Updating role for ${user.email} from ${user.role} to ${userData.role}`);
          await prisma.user.update({
            where: { email: userData.email },
            data: { role: userData.role }
          });
        }
      }
    }
    
    console.log('\nVerification and fix completed.');
    
  } catch (error) {
    console.error('Error verifying and fixing admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  verifyAndFixAdmin().catch(console.error);
}

export default verifyAndFixAdmin;