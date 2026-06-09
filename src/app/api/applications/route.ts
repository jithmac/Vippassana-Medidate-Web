import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const {
      courseId,
      courseType,
      personalInfo,
      medicalInfo,
      familyInfo,
      occupationalInfo,
      courseHistory,
      pdfDownloaded,
      status
    } = body;

    // Save personal info to user profile for prefilling in the future
    if (personalInfo) {
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          personalInfo: JSON.stringify(personalInfo)
        }
      });
    }

    // Check if it's a draft update or new submission
    if (body.id) {
      // It's an update to an existing application (e.g. from DRAFT to PENDING)
      const updated = await prisma.application.update({
        where: { id: body.id },
        data: {
          courseId: courseId !== undefined ? courseId || null : undefined,
          courseType: courseType || undefined,
          personalInfo: personalInfo ? JSON.stringify(personalInfo) : undefined,
          medicalInfo: medicalInfo ? JSON.stringify(medicalInfo) : undefined,
          familyInfo: familyInfo ? JSON.stringify(familyInfo) : undefined,
          occupationalInfo: occupationalInfo ? JSON.stringify(occupationalInfo) : undefined,
          courseHistory: courseHistory ? courseHistory : undefined,
          status: status || "PENDING",
          pdfDownloaded: pdfDownloaded !== undefined ? pdfDownloaded : undefined,
          submittedAt: status === "PENDING" ? new Date() : undefined,
        }
      });

      return NextResponse.json({ application: updated });
    }

    // Creating a new application
    const application = await prisma.application.create({
      data: {
        userId: payload.userId,
        courseId: courseId || null,
        courseType: courseType || "10-day",
        personalInfo: JSON.stringify(personalInfo || {}),
        medicalInfo: JSON.stringify(medicalInfo || {}),
        familyInfo: JSON.stringify(familyInfo || {}),
        occupationalInfo: JSON.stringify(occupationalInfo || {}),
        courseHistory: courseHistory || "[]",
        status: status || "PENDING",
        pdfDownloaded: pdfDownloaded || false,
        submittedAt: status === "PENDING" ? new Date() : null,
      }
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Application create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let whereClause: any = {};
    if (payload.role === "STUDENT") {
      whereClause = { userId: payload.userId };
    } else if (payload.role === "TEACHER") {
      whereClause = {
        OR: [
          { currentReviewStage: "PENDING_PREVIOUS", previousTeacherId: payload.userId },
          { currentReviewStage: "PENDING_NEW", newTeacherId: payload.userId },
          { currentReviewStage: "PENDING_AREA", areaTeacherId: payload.userId },
          { reviews: { some: { reviewerId: payload.userId } } }
        ]
      };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        course: true,
        user: true,
        reviews: true
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedApps = applications.map((app) => {
      let pInfo = {};
      let mInfo = {};
      let fInfo = {};
      let oInfo = {};
      
      try { pInfo = JSON.parse(app.personalInfo || "{}"); } catch(e) {}
      try { mInfo = JSON.parse(app.medicalInfo || "{}"); } catch(e) {}
      try { fInfo = JSON.parse(app.familyInfo || "{}"); } catch(e) {}
      try { oInfo = JSON.parse(app.occupationalInfo || "{}"); } catch(e) {}

      let displayStatus = app.status;
      if (payload.role === "TEACHER" && app.status === "UNDER_REVIEW") {
        const teacherApproved = app.reviews.some((r: any) => r.reviewerId === payload.userId && r.decision === "APPROVED");
        if (teacherApproved) {
          displayStatus = "APPROVED";
        }
      }

      return {
        ...app,
        status: displayStatus,
        firstName: app.user?.name?.split(" ")[0] || "",
        lastName: app.user?.name?.split(" ").slice(1).join(" ") || "",
        email: app.user?.idPassportNumber || "",
        phoneNumber: app.user?.phoneNumber || "",
        centerName: app.course?.centerName || "",
        ...pInfo,
        ...mInfo,
        ...fInfo,
        ...oInfo,
      };
    });

    return NextResponse.json({ applications: formattedApps });
  } catch (error) {
    console.error("Application get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = getUserFromCookie(req.headers.get("cookie"));
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // This won't work perfectly for PATCH /api/applications without ID in URL. Wait, the requested route is `PATCH /api/applications/[id]`. I should create `src/app/api/applications/[id]/route.ts` instead.
    
    return NextResponse.json({ error: "Not implemented here" }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

