const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('Testing Prisma client...');

    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // List all available model names
    const modelNames = Object.keys(prisma);
    console.log('✅ Available models:', modelNames);

    // Test fetching users
    console.log('Testing fetching users...');
    const users = await prisma.user.findMany({ take: 2 });
    console.log('✅ Users fetched:', users.length);

    // Test if userRole model exists and works
    console.log('Testing fetching user roles...');
    const userRoles = await prisma.userRole.findMany();
    console.log('✅ User roles fetched:', userRoles.length);

    // Test if permission model exists and works
    console.log('Testing fetching permissions...');
    const permissions = await prisma.permission.findMany();
    console.log('✅ Permissions fetched:', permissions.length);

    // Create test permissions if none exist
    if (permissions.length === 0) {
      console.log('Creating test permissions...');
      const testPermissions = [
        { name: 'users:read', description: 'Read users', module: 'users', action: 'read' },
        { name: 'users:write', description: 'Write users', module: 'users', action: 'write' },
        { name: 'properties:read', description: 'Read properties', module: 'properties', action: 'read' },
        { name: 'properties:write', description: 'Write properties', module: 'properties', action: 'write' },
        { name: 'bookings:read', description: 'Read bookings', module: 'bookings', action: 'read' },
        { name: 'bookings:write', description: 'Write bookings', module: 'bookings', action: 'write' },
      ];

      const createdPermissions = await Promise.all(
        testPermissions.map(perm => prisma.permission.create({ data: perm }))
      );

      console.log('✅ Test permissions created:', createdPermissions.length);
    }

    // Create test roles if none exist
    if (userRoles.length === 0) {
      console.log('Creating test roles...');
      const testRoles = [
        {
          name: 'Admin',
          description: 'Full system access',
          permissions: ['users:read', 'users:write', 'properties:read', 'properties:write', 'bookings:read', 'bookings:write']
        },
        {
          name: 'Host',
          description: 'Host access',
          permissions: ['properties:read', 'properties:write', 'bookings:read', 'bookings:write']
        },
        {
          name: 'Renter',
          description: 'Renter access',
          permissions: ['properties:read', 'bookings:read', 'bookings:write']
        }
      ];

      const createdRoles = await Promise.all(
        testRoles.map(role => prisma.userRole.create({ data: role }))
      );

      console.log('✅ Test roles created:', createdRoles.length);
    }

    // Verify the created roles and permissions
    const updatedRoles = await prisma.userRole.findMany({ include: { users: true } });
    const updatedPermissions = await prisma.permission.findMany();

    console.log('\n✅ Final state:');
    console.log('   - Roles:', updatedRoles.length);
    console.log('   - Permissions:', updatedPermissions.length);

    updatedRoles.forEach(role => {
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

testDatabaseConnection();
