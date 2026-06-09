import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["PREVIOUS_TEACHER", "AREA_TEACHER", "ADMIN"].includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const uncompletedEnrollments = await prisma.courseEnrollment.findMany({
      where: {
        completedAt: null
      },
      include: {
        user: {
          select: { name: true, phoneNumber: true, idPassportNumber: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ enrollments: uncompletedEnrollments });
  } catch (error) {
    console.error("Enrollments fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
