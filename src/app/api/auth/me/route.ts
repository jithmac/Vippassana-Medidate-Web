import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getUserFromCookie(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
