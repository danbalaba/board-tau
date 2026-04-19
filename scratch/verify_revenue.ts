import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const totalRevenue = await prisma.reservation.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { totalPrice: true },
  });
  
  console.log('Total Revenue (PAID):', totalRevenue._sum.totalPrice || 0);
  
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentRevenue = await prisma.reservation.aggregate({
    where: { paymentStatus: 'PAID', createdAt: { gte: last30Days } },
    _sum: { totalPrice: true },
  });
  
  console.log('Revenue (Last 30 days):', recentRevenue._sum.totalPrice || 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
