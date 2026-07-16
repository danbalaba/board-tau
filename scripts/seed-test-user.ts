import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'TestUser123',
      email: 'testuser123@boardtau.com',
      role: 'USER',
      isActive: true,
      bio: 'This is a test user for backup verification.'
    }
  })
  console.log(`Created test user with ID: ${user.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
