import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { parsePhoneNumberWithError } from "libphonenumber-js";

export async function POST(req: NextRequest) {
  try {
    const { name, country, address, idPassportNumber, phone } = await req.json();

    if (!name?.trim() || !country?.trim() || !address?.trim() || !idPassportNumber?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      const phoneNumber = parsePhoneNumberWithError(phone);
      if (!phoneNumber.isValid()) {
        return NextResponse.json({ error: "Invalid phone number for the specified country." }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid phone number format. Must include country code." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        idPassportNumber,
      }
    });

    if (existing) {
      return NextResponse.json({ error: "ID/Passport number already registered" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        country,
        address,
        idPassportNumber,
        phoneNumber: phone,
        role: "STUDENT",
      },
    });

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
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
