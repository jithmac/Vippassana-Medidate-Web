import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { sendSMS, buildSubmissionSMS } from "@/lib/sms";
import { checkEligibility, CourseRecord } from "@/lib/course-eligibility";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await req.json();

    // Check course eligibility
    let courseHistory: CourseRecord[] = [];
    try {
      courseHistory = JSON.parse(data.courseHistory || "[]");
    } catch {
      courseHistory = [];
    }

    const eligibility = checkEligibility(data.courseType, courseHistory);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: "Not eligible for this course", eligibility },
        { status: 403 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: user.userId,
        courseType: data.courseType,
        centerName: data.centerName || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
        nationality: data.nationality || "",
        passportOrNIC: data.passportOrNIC || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        civilStatus: data.civilStatus || "",
        educationLevel: data.educationLevel || "",
        familyInvolved: data.familyInvolved || false,
        familyMemberName: data.familyMemberName || "",
        emergencyContact: data.emergencyContact || "",
        emergencyPhone: data.emergencyPhone || "",
        pregnancyStatus: data.pregnancyStatus || "N/A",
        pregnancyMonths: data.pregnancyMonths || "",
        sinhalaProficiency: data.sinhalaProficiency || "NONE",
        hasDiabetes: data.hasDiabetes || false,
        hasHeartCondition: data.hasHeartCondition || false,
        hasDepression: data.hasDepression || false,
        hasAnxiety: data.hasAnxiety || false,
        hasEpilepsy: data.hasEpilepsy || false,
        hasAsthma: data.hasAsthma || false,
        hasBackProblems: data.hasBackProblems || false,
        hasHighBloodPressure: data.hasHighBloodPressure || false,
        hasHepatitis: data.hasHepatitis || false,
        hasTuberculosis: data.hasTuberculosis || false,
        hasTyphoid: data.hasTyphoid || false,
        hasOtherInfectious: data.hasOtherInfectious || false,
        hasSchizophrenia: data.hasSchizophrenia || false,
        usesDrugs: data.usesDrugs || false,
        drugDetails: data.drugDetails || "",
        otherConditions: data.otherConditions || "",
        currentMedications: data.currentMedications || "",
        dietaryRequirements: data.dietaryRequirements || "",
        disciplineDeclaration: data.disciplineDeclaration || false,
        dailyPractice: data.dailyPractice || false,
        practiceHoursPerDay: data.practiceHoursPerDay || "0",
        followsFivePrecepts: data.followsFivePrecepts || false,
        practiceDetails: data.practiceDetails || "",
        pastMeditationPractices: data.pastMeditationPractices || "",
        referredByPerson: data.referredByPerson || "",
        courseHistory: data.courseHistory || "[]",
        occupation: data.occupation || "",
        specialRequests: data.specialRequests || "",
        howHeardAboutUs: data.howHeardAboutUs || "",
        finalInstructions: data.finalInstructions || false,
      },
    });

    // Send SMS notification
    const phone = data.phoneNumber || "";
    if (phone) {
      await sendSMS(phone, buildSubmissionSMS());
    }

    return NextResponse.json({ application, eligibility });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromCookie(req.headers.get("cookie"));
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let applications;
    if (user.role === "STUDENT") {
      applications = await prisma.application.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
      });
    } else {
      applications = await prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, phone: true } } },
      });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Application fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
