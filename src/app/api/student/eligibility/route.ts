import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEligibility } from "@/lib/eligibility";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: payload.userId },
      select: { courseType: true, completedAt: true }
    });

    const eligibility = calculateEligibility(enrollments);

    return NextResponse.json(eligibility);
  } catch (error) {
    console.error("Eligibility error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
