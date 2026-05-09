import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const id = "69fa962f0a5e4dc1c43c63b5";
  
  console.log(`Checking ID: ${id}`);
  
  const reservation = await prisma.reservation.findUnique({
    where: { id }
  });
  
  if (reservation) {
    console.log("Found in Reservation table!");
  } else {
    console.log("NOT found in Reservation table.");
  }
  
  const inquiry = await prisma.inquiry.findUnique({
    where: { id }
  });
  
  if (inquiry) {
    console.log("Found in Inquiry table!");
  } else {
    console.log("NOT found in Inquiry table.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
