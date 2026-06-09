import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: payload.userId },
      orderBy: { completedAt: "desc" }
    });

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("Enrollments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
