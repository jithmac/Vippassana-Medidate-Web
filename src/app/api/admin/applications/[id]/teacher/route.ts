import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || (user.role !== "ADMIN" && !user.role.includes("TEACHER"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { teacherId } = body;

    const pendingReview = await prisma.review.findFirst({
      where: { applicationId: id, reviewerId: "pending" }
    });

    if (pendingReview) {
      await prisma.review.update({
        where: { id: pendingReview.id },
        data: { reviewerId: teacherId || "pending" },
      });
    } else if (teacherId) {
      await prisma.review.create({
        data: {
          applicationId: id,
          reviewerId: teacherId,
          reviewerRole: "TEACHER",
        }
      });
    }

    const application = await prisma.application.findUnique({
      where: { id }
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Teacher reassignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
