import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
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
      where: { idPassportNumber: "TEACHER-1" },
      update: {},
      create: {
        idPassportNumber: "TEACHER-1",
        phoneNumber: "+94777654321",
        name: "Venerable Teacher",
        role: "TEACHER",
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

    return NextResponse.json({
      message: "Seed data created successfully!",
      credentials: {
        admin: "ID: ADMIN-1 / Phone: +94771234567",
        teacher: "ID: TEACHER-1 / Phone: +94777654321",
        student: "ID: STUDENT-1 / Phone: +94779876543",
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
