import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        idPassportNumber: true,
        role: true,
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
    const { name, idPassportNumber, phoneNumber, role } = body;

    const existingUser = await prisma.user.findUnique({ where: { idPassportNumber } });
    if (existingUser) {
      return NextResponse.json({ error: "ID already registered" }, { status: 400 });
    }

    const newTeacher = await prisma.user.create({
      data: {
        name,
        idPassportNumber,
        phoneNumber,
        role: role || "TEACHER",
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
    const { userId, role } = body;

    const dataToUpdate: any = {};
    if (role !== undefined) dataToUpdate.role = role;

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
