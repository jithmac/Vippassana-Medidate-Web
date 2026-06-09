import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { parsePhoneNumberWithError } from "libphonenumber-js";

export async function POST(req: NextRequest) {
  try {
    const { idPassportNumber, phone } = await req.json();

    if (!idPassportNumber || !phone) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    let parsedPhone = phone;
    try {
      const phoneNumber = parsePhoneNumberWithError(phone);
      if (phoneNumber.isValid()) {
        parsedPhone = phoneNumber.number; 
      }
    } catch (e) {
      // ignore, we'll try to match exact input if not valid
    }

    const user = await prisma.user.findFirst({
      where: {
        idPassportNumber,
        phoneNumber: parsedPhone
      }
    });

    if (!user) {
      return NextResponse.json({ error: "No account found" }, { status: 401 });
    }

    const token = generateToken({
      userId: user.id,
      idPassportNumber: user.idPassportNumber,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, country: user.country, address: user.address, idPassportNumber: user.idPassportNumber, phone: user.phoneNumber, role: user.role, personalInfo: user.personalInfo },
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
