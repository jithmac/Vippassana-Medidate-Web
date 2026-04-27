import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { remarks } = await req.json();

    const application = await prisma.application.update({
      where: { id },
      data: { status: "REJECTED" },
      include: { user: true },
    });

    await prisma.review.create({
      data: {
        applicationId: id,
        reviewerId: user.userId,
        decision: "REJECTED",
        remarks: remarks || "",
      },
    });

    const phone = application.phoneNumber || application.user.phone;
    if (phone) {
      await sendSMS(
        phone,
        `We regret to inform you that your application has not been approved at this time. Reason: ${remarks || "Not specified"}. Please contact the center for more information.`
      );
    }

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Rejection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
