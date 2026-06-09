import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Teacher
  await prisma.user.upsert({
    where: { idPassportNumber: 'TEACHER123' },
    update: {
      phoneNumber: '+94777123456',
    },
    create: {
      idPassportNumber: 'TEACHER123',
      name: 'Mock Teacher',
      phoneNumber: '+94777123456',
      role: 'TEACHER',
    },
  })

  // Student
  await prisma.user.upsert({
    where: { idPassportNumber: 'STUDENT123' },
    update: {
      phoneNumber: '+94777987654',
    },
    create: {
      idPassportNumber: 'STUDENT123',
      name: 'Mock Student',
      phoneNumber: '+94777987654',
      role: 'STUDENT',
    },
  })

  console.log('Mock accounts created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
