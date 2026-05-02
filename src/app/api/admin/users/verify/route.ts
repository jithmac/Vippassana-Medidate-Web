import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "verifyAdmin") {
      const { adminPassword } = body;
      const adminUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!adminUser) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      
      const isValid = await verifyPassword(adminPassword, adminUser.password);
      if (!isValid) return NextResponse.json({ error: "Incorrect admin password" }, { status: 400 });
      
      return NextResponse.json({ success: true });
    }

    if (action === "verifyUser") {
      const { userId, targetUserIdCard, targetUserPhone } = body;
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const userCard = targetUser.idCardNumber || "";
      const inputCard = targetUserIdCard || "";
      if (userCard.trim().toLowerCase() !== inputCard.trim().toLowerCase()) {
        return NextResponse.json({ error: "ID Card Number does not match" }, { status: 400 });
      }

      const userPhone = targetUser.phone || "";
      const inputPhone = targetUserPhone || "";
      if (userPhone.replace(/\s+/g, '') !== inputPhone.replace(/\s+/g, '')) {
        return NextResponse.json({ error: "Phone Number does not match" }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
