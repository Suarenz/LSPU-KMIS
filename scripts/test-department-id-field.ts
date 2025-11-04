import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDepartmentIdField() {
  try {
    console.log('Testing departmentId field access...');
    
    // Try to fetch a user with departmentId field
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        departmentId: true,  // This was causing the error before
        department: true,
      }
    });
    
    if (user) {
      console.log('✓ Successfully fetched user with departmentId field:');
      console.log('  - ID:', user.id);
      console.log('  - Email:', user.email);
      console.log('  - Name:', user.name);
      console.log('  - Department ID:', user.departmentId);
      console.log('  - Department (old field):', user.department);
    } else {
      console.log('⚠ No users found, but departmentId field access works');
    }
    
    // Also test updating a user with departmentId
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: users[0].id },
        data: { departmentId: users[0].departmentId }, // Just update with same value to test
        select: {
          id: true,
          departmentId: true
        }
      });
      
      console.log('✓ Successfully updated user with departmentId field');
    }
    
    console.log('\n✓ All departmentId field tests passed!');
    console.log('The database schema issue has been resolved.');
  } catch (error) {
    console.error('✗ Error testing departmentId field:', error);
    throw error;
 } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testDepartmentIdField()
    .then(() => {
      console.log('\nScript completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nScript failed:', error);
      process.exit(1);
    });
}