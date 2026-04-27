import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const studentPassword = await bcrypt.hash("student123", 12);

  await prisma.user.upsert({
    where: { email: "admin@dhamma.org" },
    update: {},
    create: {
      email: "admin@dhamma.org",
      password: adminPassword,
      name: "Dhamma Admin",
      phone: "+94771234567",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "teacher@dhamma.org" },
    update: {},
    create: {
      email: "teacher@dhamma.org",
      password: teacherPassword,
      name: "Venerable Teacher",
      phone: "+94777654321",
      role: "TEACHER",
    },
  });

  await prisma.user.upsert({
    where: { email: "student@dhamma.org" },
    update: {},
    create: {
      email: "student@dhamma.org",
      password: studentPassword,
      name: "Saddha Kumari",
      phone: "+94779876543",
      role: "STUDENT",
    },
  });

  await prisma.courseSchedule.createMany({
    data: [
      {
        courseType: "10-day",
        centerName: "Dhamma Maneeratta",
        startDate: "2026-06-01",
        endDate: "2026-06-12",
        capacity: 60,
      },
      {
        courseType: "10-day",
        centerName: "Dhamma Mowbray",
        startDate: "2026-07-01",
        endDate: "2026-07-12",
        capacity: 40,
      },
      {
        courseType: "20-day",
        centerName: "Dhamma Maneeratta",
        startDate: "2026-08-01",
        endDate: "2026-08-22",
        capacity: 30,
      },
    ],
  });

  console.log("Seed data created successfully!");
  console.log("Admin:   admin@dhamma.org / admin123");
  console.log("Teacher: teacher@dhamma.org / teacher123");
  console.log("Student: student@dhamma.org / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
