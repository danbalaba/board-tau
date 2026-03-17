const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignAllRoles() {
  try {
    console.log('Assigning roles to all users...');

    // Connect to database
    await prisma.$connect();

    // Get all roles
    const roles = await prisma.userRole.findMany();
    console.log('✅ Roles found:', roles.map(r => r.name));

    // Get all users
    const users = await prisma.user.findMany();
    console.log('✅ Users found:', users.length);

    // Create a map of role names to role ids
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name.toLowerCase()] = role.id;
    });

    console.log('✅ Role map:', roleMap);

    // Assign roles to users
    const updatedUsers = [];
    for (const user of users) {
      const userRoleName = user.role.toLowerCase();
      const roleId = roleMap[userRoleName];

      if (roleId) {
        // If user's role exists in userRole table
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { roleId: roleId }
        });
        updatedUsers.push(updatedUser);
        console.log(`✅ Assigned ${userRoleName} role to ${user.email}`);
      } else {
        // If user's role doesn't exist (default to user)
        const userRoleId = roleMap['user'];
        if (userRoleId) {
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { roleId: userRoleId, role: 'user' } // Also update role field to user
          });
          updatedUsers.push(updatedUser);
          console.log(`✅ Assigned user role to ${user.email} (default)`);
        }
      }
    }

    console.log(`\n✅ Total users updated: ${updatedUsers.length}`);

    // Verify the changes
    const usersWithRoles = await prisma.user.findMany({
      include: { roleRelation: true }
    });

    console.log('\n✅ Final users with roles:');
    usersWithRoles.forEach(user => {
      console.log(`\n   🚀 User: ${user.email}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Role Relation: ${user.roleRelation?.name}`);
    });

    // Verify role counts
    console.log('\n✅ Role counts:');
    roles.forEach(async role => {
      const roleCount = await prisma.user.count({
        where: { roleId: role.id }
      });
      console.log(`   🚀 ${role.name}: ${roleCount} users`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAllRoles();
