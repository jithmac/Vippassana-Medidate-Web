import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie, hashPassword, verifyPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        idCardNumber: true,
        birthday: true,
        role: true,
        currentStage: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newTeacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TEACHER",
      },
    });

    return NextResponse.json({ success: true, teacherId: newTeacher.id });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, stage, newPassword, adminPassword, targetUserIdCard, targetUserPhone } = body;

    const dataToUpdate: any = {};
    if (stage !== undefined) dataToUpdate.currentStage = parseInt(stage, 10);
    
    if (newPassword) {
      if (!adminPassword || !targetUserIdCard || !targetUserPhone) {
        return NextResponse.json({ error: "Missing verification details for password reset" }, { status: 400 });
      }

      const adminUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!adminUser) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      
      const isAdminPasswordValid = await verifyPassword(adminPassword, adminUser.password);
      if (!isAdminPasswordValid) {
        return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
      }

      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) return NextResponse.json({ error: "Target user not found" }, { status: 404 });

      // Compare taking into account possible empty strings or missing values for old accounts
      const userCard = targetUser.idCardNumber || "";
      const inputCard = targetUserIdCard || "";
      if (userCard.trim().toLowerCase() !== inputCard.trim().toLowerCase()) {
        return NextResponse.json({ error: "Target user ID Card Number does not match" }, { status: 400 });
      }

      const userPhone = targetUser.phone || "";
      const inputPhone = targetUserPhone || "";
      if (userPhone.replace(/\s+/g, '') !== inputPhone.replace(/\s+/g, '')) {
        return NextResponse.json({ error: "Target user Phone Number does not match" }, { status: 400 });
      }

      dataToUpdate.password = await hashPassword(newPassword);
    }

    // Only update if there is something to update
    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
