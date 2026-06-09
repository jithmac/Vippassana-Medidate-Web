import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { reviewId, action, remarks } = await req.json();

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { application: true }
    });

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if (review.reviewerRole !== payload.role) return NextResponse.json({ error: "Unauthorized role for this review" }, { status: 403 });

    // Handle Claim
    if (action === "CLAIM") {
      if (review.reviewerId) return NextResponse.json({ error: "Already claimed" }, { status: 400 });
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { reviewerId: payload.userId }
      });
      return NextResponse.json({ success: true, review: updated });
    }

    // Must be claimed by this user to make a decision
    if (review.reviewerId !== payload.userId) {
      return NextResponse.json({ error: "You must claim this review first" }, { status: 400 });
    }

    if (action === "APPROVE") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { decision: "APPROVED", remarks, reviewedAt: new Date() }
      });

      if (payload.role === "NEW_TEACHER" || payload.role === "PREVIOUS_TEACHER") {
        // Escalate to AREA_TEACHER
        await prisma.review.create({
          data: {
            applicationId: review.applicationId,
            reviewerRole: "AREA_TEACHER"
          }
        });
        await prisma.application.update({
          where: { id: review.applicationId },
          data: { status: "UNDER_REVIEW" }
        });
      } else if (payload.role === "AREA_TEACHER") {
        // Final Approval
        await prisma.application.update({
          where: { id: review.applicationId },
          data: { status: "APPROVED" }
        });

        // Increment course enrollment count
        if (review.application.courseId) {
          await prisma.courseSchedule.update({
            where: { id: review.application.courseId },
            data: { enrolled: { increment: 1 } }
          });
        }
        
        // Create an uncompleted enrollment record
        await prisma.courseEnrollment.create({
          data: {
            userId: review.application.userId,
            courseType: review.application.courseType,
            // completedAt is null until course completes
          }
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "REJECT") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { decision: "REJECTED", remarks, reviewedAt: new Date() }
      });
      await prisma.application.update({
        where: { id: review.applicationId },
        data: { status: "REJECTED" }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "NEEDS_INFO") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { decision: "NEEDS_INFO", remarks, reviewedAt: new Date() }
      });
      await prisma.application.update({
        where: { id: review.applicationId },
        data: { status: "DRAFT" } // Let student edit and resubmit
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Review action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
