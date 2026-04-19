
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reservations = await prisma.reservation.findMany({
    select: {
      id: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      totalPrice: true
    }
  });
  console.log('Total Reservations:', reservations.length);
  console.log('Reservations:', JSON.stringify(reservations, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
