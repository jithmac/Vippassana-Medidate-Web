const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database...");
  await prisma.smsLog.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.courseSchedule.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating Admin...");
  await prisma.user.create({
    data: {
      name: "System Admin",
      idPassportNumber: "ADMIN001",
      phoneNumber: "+94770000000",
      role: "ADMIN"
    }
  });

  console.log("Creating 5 Teachers...");
  const teachers = [];
  for (let i = 1; i <= 5; i++) {
    const t = await prisma.user.create({
      data: {
        name: `Teacher ${i}`,
        idPassportNumber: `TEACHER00${i}`,
        phoneNumber: `+9477000000${i}`,
        role: "TEACHER"
      }
    });
    teachers.push(t);
  }

  console.log("Creating Students...");
  
  // 1. Brand New Student
  await prisma.user.create({
    data: {
      name: "New Student",
      idPassportNumber: "NEW001",
      phoneNumber: "+94771000001",
      role: "STUDENT"
    }
  });

  // 2. Returning Student (1x 10-day completed 20 days ago)
  const retStudent = await prisma.user.create({
    data: {
      name: "Returning Student",
      idPassportNumber: "RET001",
      phoneNumber: "+94771000002",
      role: "STUDENT"
    }
  });
  const date20DaysAgo = new Date();
  date20DaysAgo.setDate(date20DaysAgo.getDate() - 20);
  await prisma.courseEnrollment.create({
    data: {
      userId: retStudent.id,
      courseType: "10-day",
      completedAt: date20DaysAgo
    }
  });

  // 3. Very Experienced Student (6x 10-day, eligible for 20-day)
  const expStudent = await prisma.user.create({
    data: {
      name: "Experienced Student",
      idPassportNumber: "EXP001",
      phoneNumber: "+94771000003",
      role: "STUDENT"
    }
  });
  for(let i=0; i<6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (i + 1));
    await prisma.courseEnrollment.create({
      data: {
        userId: expStudent.id,
        courseType: "10-day",
        completedAt: d
      }
    });
  }

  // 4. Highly Experienced Student (7x 10-day, 1x 20-day, eligible for 30-day)
  const highlyExpStudent = await prisma.user.create({
    data: {
      name: "Highly Experienced Student",
      idPassportNumber: "HIGH001",
      phoneNumber: "+94771000004",
      role: "STUDENT"
    }
  });
  for(let i=0; i<7; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (i + 2));
    await prisma.courseEnrollment.create({
      data: {
        userId: highlyExpStudent.id,
        courseType: "10-day",
        completedAt: d
      }
    });
  }
  const d20 = new Date();
  d20.setMonth(d20.getMonth() - 1);
  await prisma.courseEnrollment.create({
    data: {
      userId: highlyExpStudent.id,
      courseType: "20-day",
      completedAt: d20
    }
  });

  // 5. Waiting Period Student (10-day completed 2 days ago)
  const waitingStudent = await prisma.user.create({
    data: {
      name: "Waiting Period Student",
      idPassportNumber: "WAIT001",
      phoneNumber: "+94771000005",
      role: "STUDENT"
    }
  });
  const date2DaysAgo = new Date();
  date2DaysAgo.setDate(date2DaysAgo.getDate() - 2);
  await prisma.courseEnrollment.create({
    data: {
      userId: waitingStudent.id,
      courseType: "10-day",
      completedAt: date2DaysAgo
    }
  });

  console.log("Creating Courses...");
  const dStart = new Date();
  dStart.setDate(dStart.getDate() + 30);
  const dEnd = new Date(dStart);
  dEnd.setDate(dEnd.getDate() + 10);

  const courses = ["10-day", "20-day", "30-day", "Dhamma Sewa"];
  for (const c of courses) {
    await prisma.courseSchedule.create({
      data: {
        courseType: c,
        centerName: "Dhamma Maneeratta",
        startDate: dStart.toISOString().split('T')[0],
        endDate: dEnd.toISOString().split('T')[0],
        capacity: 100,
        enrolled: 0,
        status: "OPEN"
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
