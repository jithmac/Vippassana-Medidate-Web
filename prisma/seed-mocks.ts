import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Teacher
  await prisma.user.upsert({
    where: { email: 'teacher2@dhamma.org' },
    update: {
      idCardNumber: 'TEACHER123',
    },
    create: {
      email: 'teacher2@dhamma.org',
      name: 'Mock Teacher',
      password: hashedPassword,
      role: 'TEACHER',
      idCardNumber: 'TEACHER123',
    },
  })

  // Student
  await prisma.user.upsert({
    where: { email: 'student2@dhamma.org' },
    update: {
      idCardNumber: 'STUDENT123',
    },
    create: {
      email: 'student2@dhamma.org',
      name: 'Mock Student',
      password: hashedPassword,
      role: 'STUDENT',
      idCardNumber: 'STUDENT123',
      currentStage: 1,
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
