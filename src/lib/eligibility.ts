export type CourseType = "10-day" | "20-day" | "30-day" | "Dhamma Sewa";

export interface EnrollmentRecord {
  courseType: string;
  completedAt: Date | null;
}

export interface EligibilityResult {
  eligibleCourses: CourseType[];
  waitingPeriodActive: boolean;
  daysUntilEligible: number;
  lastCompletionDate: string | null;
  completed10DayCount: number;
  completed20DayCount: number;
  completed30DayCount: number;
}

export function calculateEligibility(enrollments: EnrollmentRecord[]): EligibilityResult {
  const completedEnrollments = enrollments.filter(e => e.completedAt !== null);
  
  if (completedEnrollments.length === 0) {
    return {
      eligibleCourses: ["10-day"],
      waitingPeriodActive: false,
      daysUntilEligible: 0,
      lastCompletionDate: null,
      completed10DayCount: 0,
      completed20DayCount: 0,
      completed30DayCount: 0,
    };
  }

  let completed10Day = 0;
  let completed20Day = 0;
  let completed30Day = 0;
  let lastCompletionDate = new Date(0);

  completedEnrollments.forEach(e => {
    if (e.courseType === "10-day") completed10Day++;
    if (e.courseType === "20-day") completed20Day++;
    if (e.courseType === "30-day") completed30Day++;
    
    const d = new Date(e.completedAt!);
    if (d > lastCompletionDate) {
      lastCompletionDate = d;
    }
  });

  const today = new Date();
  const timeDiff = today.getTime() - lastCompletionDate.getTime();
  const daysSinceLastCompletion = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  const WAITING_PERIOD_DAYS = 10;
  const hasWaited = daysSinceLastCompletion >= WAITING_PERIOD_DAYS;
  const daysUntilEligible = hasWaited ? 0 : WAITING_PERIOD_DAYS - daysSinceLastCompletion;

  const result: EligibilityResult = {
    eligibleCourses: [],
    waitingPeriodActive: !hasWaited,
    daysUntilEligible,
    lastCompletionDate: lastCompletionDate.toISOString(),
    completed10DayCount: completed10Day,
    completed20DayCount: completed20Day,
    completed30DayCount: completed30Day,
  };

  if (!hasWaited) {
    result.eligibleCourses = ["Dhamma Sewa"];
    return result; // returning student AND NOT hasWaited -> Dhamma Sewa only
  }

  // hasWaited is true from here down
  const eligible: CourseType[] = ["10-day", "Dhamma Sewa"];

  if (completed10Day >= 5) {
    eligible.push("20-day");
  }
  
  if (completed10Day >= 6 && completed20Day >= 1) {
    eligible.push("30-day");
  }

  result.eligibleCourses = eligible;
  return result;
}
