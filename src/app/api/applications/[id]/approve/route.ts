import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { sendSMS, buildApprovalSMS } from "@/lib/sms";

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
      include: { user: true, reviews: true }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Validate current stage
    if (application.currentReviewStage === "PENDING_PREVIOUS") {
      if (user.userId !== application.previousTeacherId && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized for this stage" }, { status: 403 });
      }
    } else if (application.currentReviewStage === "PENDING_NEW") {
      if (user.userId !== application.newTeacherId && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized for this stage" }, { status: 403 });
      }
    } else if (application.currentReviewStage === "PENDING_AREA") {
      if (user.userId !== application.areaTeacherId && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized for this stage" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "No active review stage" }, { status: 400 });
    }

    const approvedTeacherIds = application.reviews.filter(r => r.decision === "APPROVED").map(r => r.reviewerId);
    approvedTeacherIds.push(user.userId);

    let nextStage = null;
    let newStatus = "UNDER_REVIEW";

    // Determine the next unapproved stage
    if (application.currentReviewStage === "PENDING_PREVIOUS") {
      if (!approvedTeacherIds.includes(application.newTeacherId)) {
        nextStage = "PENDING_NEW";
      } else if (!approvedTeacherIds.includes(application.areaTeacherId)) {
        nextStage = "PENDING_AREA";
      } else {
        nextStage = "COMPLETED";
      }
    } else if (application.currentReviewStage === "PENDING_NEW") {
      if (!approvedTeacherIds.includes(application.areaTeacherId)) {
        nextStage = "PENDING_AREA";
      } else {
        nextStage = "COMPLETED";
      }
    } else if (application.currentReviewStage === "PENDING_AREA") {
      nextStage = "COMPLETED";
    }

    if (nextStage === "COMPLETED") {
      newStatus = "APPROVED";
    }

    // Update Application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        currentReviewStage: nextStage,
        status: newStatus,
      },
      include: { user: true },
    });

    // Record this approval in Reviews (for history)
    await prisma.review.create({
      data: {
        applicationId: id,
        reviewerId: user.userId,
        reviewerRole: "TEACHER",
        decision: "APPROVED",
        remarks: `Approved at stage: ${application.currentReviewStage}`,
        reviewedAt: new Date(),
      }
    });

    // If fully approved, increment enrollment and send SMS
    if (newStatus === "APPROVED") {
      let startDate = "TBD";
      let center = "TBD";

      if (updatedApplication.courseId) {
        const schedule = await prisma.courseSchedule.findUnique({
          where: { id: updatedApplication.courseId }
        });
        
        if (schedule) {
          startDate = schedule.startDate || "TBD";
          center = schedule.centerName || center;

          await prisma.courseSchedule.update({
            where: { id: schedule.id },
            data: { enrolled: { increment: 1 } }
          });
        }
      }

      const phone = updatedApplication.user?.phoneNumber;
      if (phone) {
        const smsMessage = buildApprovalSMS(
          updatedApplication.user.name,
          center,
          startDate,
          "White clothing, personal toiletries, meditation cushion"
        );
        await sendSMS(phone, smsMessage);
      }
      
      return NextResponse.json({ success: true, application: updatedApplication, stage: "FINAL" });
    }

    return NextResponse.json({ success: true, application: updatedApplication, stage: "ESCALATED" });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
