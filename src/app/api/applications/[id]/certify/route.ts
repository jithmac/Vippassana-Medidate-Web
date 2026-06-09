import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && !user.role.includes("TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "APPROVED") {
      return NextResponse.json({ error: "Application must be fully approved to certify completion." }, { status: 400 });
    }

    if (application.isCompleted) {
      return NextResponse.json({ error: "Application is already certified as completed." }, { status: 400 });
    }

    // Only allow Admin or the specific New Teacher to certify
    if (user.role !== "ADMIN" && user.userId !== application.newTeacherId) {
      return NextResponse.json({ error: "Only the assigned New Teacher can certify this completion." }, { status: 403 });
    }

    // Wrap in a transaction to ensure both records are updated
    await prisma.$transaction([
      prisma.courseEnrollment.create({
        data: {
          userId: application.userId,
          courseType: application.courseType,
          completedAt: new Date(),
        }
      }),
      prisma.application.update({
        where: { id },
        data: {
          isCompleted: true
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Certify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
