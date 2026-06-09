import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const oldApp = await prisma.application.findUnique({
      where: { id, userId: user.userId },
    });

    if (!oldApp) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (oldApp.status !== "REJECTED") {
      return NextResponse.json({ error: "Only rejected applications can be resent" }, { status: 400 });
    }

    // Create a new application with the same data, but resetting state
    const newApp = await prisma.application.create({
      data: {
        userId: oldApp.userId,
        courseId: oldApp.courseId,
        courseType: oldApp.courseType,
        personalInfo: oldApp.personalInfo,
        medicalInfo: oldApp.medicalInfo,
        familyInfo: oldApp.familyInfo,
        occupationalInfo: oldApp.occupationalInfo,
        courseHistory: oldApp.courseHistory,
        assistantTeacherRemarks: oldApp.assistantTeacherRemarks,
        regionalCoordinatorRemarks: oldApp.regionalCoordinatorRemarks,
        status: "PENDING",
        // Do not copy routing logic or IDs
      }
    });

    return NextResponse.json({ success: true, application: newApp });
  } catch (error) {
    console.error("Resend application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
