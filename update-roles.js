const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRoles() {
  try {
    console.log('Updating roles...');

    // Connect to database
    await prisma.$connect();

    // Update Renter role to User
    const updatedRole = await prisma.userRole.update({
      where: { name: 'Renter' },
      data: {
        name: 'User',
        description: 'User access',
        permissions: ['properties:read', 'bookings:read']
      }
    });

    console.log('✅ Role updated:', updatedRole);

    // Verify the changes
    const roles = await prisma.userRole.findMany({ include: { users: true } });
    console.log('\n✅ Current roles:');
    roles.forEach(role => {
      console.log(`\n   🚀 Role: ${role.name}`);
      console.log(`      Description: ${role.description}`);
      console.log(`      Permissions: ${role.permissions.length}`);
      console.log(`      Users: ${role.users.length}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRoles();
