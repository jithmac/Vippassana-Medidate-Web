import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["NEW_TEACHER", "PREVIOUS_TEACHER", "AREA_TEACHER"].includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    const pendingReviews = await prisma.review.findMany({
      where: {
        reviewerRole: payload.role,
        decision: null,
        // Only show reviews that are unassigned OR assigned to this specific teacher
        OR: [
          { reviewerId: null },
          { reviewerId: payload.userId }
        ]
      },
      include: {
        application: {
          include: {
            user: {
              select: { name: true, phoneNumber: true, country: true, idPassportNumber: true }
            },
            course: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ reviews: pendingReviews });
  } catch (error) {
    console.error("Pending reviews fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
