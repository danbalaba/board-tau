
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const resCount = await prisma.reservation.count();
  const paidResCount = await prisma.reservation.count({ where: { paymentStatus: 'PAID' } });
  const totalRevenue = await prisma.reservation.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { totalPrice: true }
  });

  const userCount = await prisma.user.count();
  const activeUserCount = await prisma.user.count({ where: { isActive: true } });

  console.log('--- Reservations ---');
  console.log('Total:', resCount);
  console.log('Paid:', paidResCount);
  console.log('Total Revenue:', totalRevenue._sum.totalPrice || 0);

  console.log('\n--- Users ---');
  console.log('Total:', userCount);
  console.log('Active:', activeUserCount);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
