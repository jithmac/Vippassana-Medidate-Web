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

    if (user.role !== "ADMIN" && user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { remarks, centerName, date, items } = await req.json();

    const application = await prisma.application.update({
      where: { id },
      data: { status: "APPROVED" },
      include: { user: true },
    });

    await prisma.review.create({
      data: {
        applicationId: id,
        reviewerId: user.userId,
        decision: "APPROVED",
        remarks: remarks || "",
      },
    });

    // Send approval SMS
    const phone = application.phoneNumber || application.user.phone;
    if (phone) {
      const smsMessage = buildApprovalSMS(
        user.name,
        centerName || application.centerName,
        date || "TBD",
        items || "White clothing, personal toiletries, meditation cushion"
      );
      await sendSMS(phone, smsMessage);
    }

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
