import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { teacherId } = body;

    const application = await prisma.application.update({
      where: { id: params.id },
      data: { selectedTeacherId: teacherId || null },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Teacher reassignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
