import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { previousTeacherId, newTeacherId, areaTeacherId } = body;

    if (!newTeacherId || !areaTeacherId) {
      return NextResponse.json({ error: "New Teacher and Area Teacher are required." }, { status: 400 });
    }

    const currentReviewStage = previousTeacherId ? "PENDING_PREVIOUS" : "PENDING_NEW";

    const application = await prisma.application.update({
      where: { id },
      data: {
        previousTeacherId: previousTeacherId || null,
        newTeacherId,
        areaTeacherId,
        currentReviewStage,
        status: "UNDER_REVIEW",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
