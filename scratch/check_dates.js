
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reservations = await prisma.reservation.findMany({
    where: { paymentStatus: 'PAID' },
    select: { createdAt: true, totalPrice: true }
  });

  console.log('Paid Reservations:');
  reservations.forEach((r, i) => {
    console.log(`${i+1}. Date: ${r.createdAt.toISOString()}, Amount: ${r.totalPrice}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
