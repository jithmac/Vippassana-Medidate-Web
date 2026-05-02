import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone, idCardNumber, birthday, role } = await req.json();

    if (!idCardNumber?.trim() || !password || !name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json({ error: "Invalid phone number format. Must include country code." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { idCardNumber },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "ID Card or Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email || null,
        idCardNumber,
        password: hashedPassword,
        name,
        phone,
        birthday: birthday || "",
        role: role || "STUDENT",
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email || "",
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set("dhamma_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
