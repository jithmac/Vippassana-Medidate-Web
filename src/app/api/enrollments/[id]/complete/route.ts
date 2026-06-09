import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["PREVIOUS_TEACHER", "AREA_TEACHER", "ADMIN"].includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const { attendanceData, completionReview } = await req.json();

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id }
    });

    if (!enrollment) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

    const updated = await prisma.courseEnrollment.update({
      where: { id },
      data: {
        completedAt: new Date(),
        attendanceData: attendanceData ? JSON.stringify(attendanceData) : undefined,
        completionReview
      }
    });

    return NextResponse.json({ success: true, enrollment: updated });
  } catch (error) {
    console.error("Complete enrollment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
