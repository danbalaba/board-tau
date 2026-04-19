
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.groupBy({
    by: ['role'],
    _count: true
  });
  console.log('User Roles:', JSON.stringify(users, null, 2));

  const hostApps = await prisma.hostApplication.count();
  console.log('Host Applications Count:', hostApps);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
