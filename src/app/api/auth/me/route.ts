import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const payload = getUserFromCookie(req.headers.get("cookie"));
  if (!payload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, role: true, phoneNumber: true, country: true, address: true, idPassportNumber: true, personalInfo: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Map db field phoneNumber to phone for frontend consistency
  return NextResponse.json({ user: { ...user, phone: user.phoneNumber } });
}
