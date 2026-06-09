import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { idPassportNumber: "ADMIN-1" },
    update: {},
    create: {
      idPassportNumber: "ADMIN-1",
      phoneNumber: "+94771234567",
      name: "Dhamma Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { idPassportNumber: "NEW-TEACHER-1" },
    update: {},
    create: {
      idPassportNumber: "NEW-TEACHER-1",
      phoneNumber: "+94777654321",
      name: "New Teacher",
      role: "NEW_TEACHER",
    },
  });

  await prisma.user.upsert({
    where: { idPassportNumber: "PREV-TEACHER-1" },
    update: {},
    create: {
      idPassportNumber: "PREV-TEACHER-1",
      phoneNumber: "+94777654322",
      name: "Previous Teacher",
      role: "PREVIOUS_TEACHER",
    },
  });

  await prisma.user.upsert({
    where: { idPassportNumber: "AREA-TEACHER-1" },
    update: {},
    create: {
      idPassportNumber: "AREA-TEACHER-1",
      phoneNumber: "+94777654323",
      name: "Area Teacher",
      role: "AREA_TEACHER",
    },
  });

  await prisma.user.upsert({
    where: { idPassportNumber: "STUDENT-1" },
    update: {},
    create: {
      idPassportNumber: "STUDENT-1",
      phoneNumber: "+94779876543",
      name: "Saddha Kumari",
      role: "STUDENT",
    },
  });

  const existingSchedules = await prisma.courseSchedule.count();
  if (existingSchedules === 0) {
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
  }

  // Student 2: Eligible for 20-day course (has completed a 10-day course)
  const student2 = await prisma.user.upsert({
    where: { idPassportNumber: "STUDENT-2" },
    update: {},
    create: {
      idPassportNumber: "STUDENT-2",
      phoneNumber: "+94779876544",
      name: "Kasun Perera (20-day eligible)",
      role: "STUDENT",
      enrollments: {
        create: {
          courseType: "10-day",
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Completed 30 days ago
        }
      }
    },
  });

  // Student 3: Eligible for 30-day course (has completed a 20-day course)
  const student3 = await prisma.user.upsert({
    where: { idPassportNumber: "STUDENT-3" },
    update: {},
    create: {
      idPassportNumber: "STUDENT-3",
      phoneNumber: "+94779876545",
      name: "Nimal Silva (30-day eligible)",
      role: "STUDENT",
      enrollments: {
        create: [
          {
            courseType: "10-day",
            completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Completed 60 days ago
          },
          {
            courseType: "20-day",
            completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Completed 30 days ago
          }
        ]
      }
    },
  });

  console.log("Seed data created successfully!");
  console.log("Admin:   ID: ADMIN-1 / Phone: +94771234567");
  console.log("New Teacher: ID: NEW-TEACHER-1 / Phone: +94777654321");
  console.log("Previous Teacher: ID: PREV-TEACHER-1 / Phone: +94777654322");
  console.log("Area Teacher: ID: AREA-TEACHER-1 / Phone: +94777654323");
  console.log("Student (10-day eligible): ID: STUDENT-1 / Phone: +94779876543");
  console.log("Student (20-day eligible): ID: STUDENT-2 / Phone: +94779876544");
  console.log("Student (30-day eligible): ID: STUDENT-3 / Phone: +94779876545");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
