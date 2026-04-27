import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    const adminPassword = await hashPassword("admin123");
    const teacherPassword = await hashPassword("teacher123");
    const studentPassword = await hashPassword("student123");

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

    return NextResponse.json({
      message: "Seed data created successfully!",
      credentials: {
        admin: "admin@dhamma.org / admin123",
        teacher: "teacher@dhamma.org / teacher123",
        student: "student@dhamma.org / student123",
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
