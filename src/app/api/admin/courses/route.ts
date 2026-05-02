import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getUserFromCookie(req.headers.get("cookie"));
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.courseSchedule.findMany({
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Admin courses fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getUserFromCookie(req.headers.get("cookie"));
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseType, centerName, startDate, endDate, capacity, stage, teacherId, itemsToBring } = await req.json();

    const course = await prisma.courseSchedule.create({
      data: {
        courseType,
        centerName,
        startDate,
        endDate,
        capacity: Number(capacity) || 100,
        stage: Number(stage) || 1,
        teacherId,
        itemsToBring: itemsToBring || "White clothing, personal toiletries, meditation cushion",
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Admin course create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
