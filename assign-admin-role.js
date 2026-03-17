const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignAdminRole() {
  try {
    console.log('Assigning admin role...');

    // Connect to database
    await prisma.$connect();

    // Get the admin role
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.error('❌ Admin role not found');
      return;
    }

    console.log('✅ Admin role found:', adminRole.name);

    // Get all users with admin role in user model
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' }
    });

    console.log('✅ Admin users found:', adminUsers.length);

    // Assign admin role to these users
    const updatedUsers = await Promise.all(
      adminUsers.map(user =>
        prisma.user.update({
          where: { id: user.id },
          data: { roleId: adminRole.id }
        })
      )
    );

    console.log('✅ Users updated:', updatedUsers.length);

    // Verify the changes
    const usersWithRoles = await prisma.user.findMany({
      include: { roleRelation: true }
    });

    console.log('\n✅ Users with roles:');
    usersWithRoles.forEach(user => {
      console.log(`\n   🚀 User: ${user.email}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Role Relation: ${user.roleRelation?.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdminRole();
