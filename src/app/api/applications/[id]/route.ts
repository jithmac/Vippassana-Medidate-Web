import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Wait for params in Next.js App Router
    const params = await context.params;
    const { id } = params;

    const body = await req.json();
    const {
      courseId,
      courseType,
      personalInfo,
      medicalInfo,
      familyInfo,
      occupationalInfo,
      pdfDownloaded,
      status
    } = body;

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing || existing.userId !== payload.userId) {
        return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        courseId: courseId !== undefined ? courseId : undefined,
        courseType: courseType !== undefined ? courseType : undefined,
        personalInfo: personalInfo ? JSON.stringify(personalInfo) : undefined,
        medicalInfo: medicalInfo ? JSON.stringify(medicalInfo) : undefined,
        familyInfo: familyInfo ? JSON.stringify(familyInfo) : undefined,
        occupationalInfo: occupationalInfo ? JSON.stringify(occupationalInfo) : undefined,
        status: status !== undefined ? status : undefined,
        pdfDownloaded: pdfDownloaded !== undefined ? pdfDownloaded : undefined,
        submittedAt: status === "PENDING" && existing.status !== "PENDING" ? new Date() : undefined,
      }
    });

    if (status === "PENDING" && existing.status !== "PENDING") {
      // Check if returning student
      const completedCount = await prisma.courseEnrollment.count({
        where: { userId: payload.userId, completedAt: { not: null } }
      });
      const reviewerRole = completedCount > 0 ? "PREVIOUS_TEACHER" : "NEW_TEACHER";
      
      await prisma.review.create({
        data: {
          applicationId: updated.id,
          reviewerId: "pending", // Will be claimed
          reviewerRole,
        }
      });
    }

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error("Application patch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
