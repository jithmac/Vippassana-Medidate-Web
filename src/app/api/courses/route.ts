import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getUserFromCookie(req.headers.get("cookie"));
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const courses = await prisma.courseSchedule.findMany({
      where: {
        status: "OPEN",
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
