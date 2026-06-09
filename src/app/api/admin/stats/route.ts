import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || (user.role !== "ADMIN" && !user.role.includes("TEACHER"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [totalStudents, totalApplications, pendingApplications, approvedApplications] =
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.application.count(),
        prisma.application.count({ where: { status: "PENDING" } }),
        prisma.application.count({ where: { status: "APPROVED" } }),
      ]);

    return NextResponse.json({
      stats: {
        totalStudents,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications: totalApplications - pendingApplications - approvedApplications,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
