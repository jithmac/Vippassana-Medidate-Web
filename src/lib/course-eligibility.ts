export interface CourseRecord {
  courseType: string;
  startDate: string;
  endDate: string;
  centerName: string;
  completed: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
  nextCourses: string[];
  currentPhase: string;
}

function countCompleted(history: CourseRecord[], type: string): number {
  return history.filter((c) => c.courseType === type && c.completed).length;
}

function hasCompleted(history: CourseRecord[], type: string): boolean {
  return countCompleted(history, type) > 0;
}

export function checkEligibility(courseType: string, history: CourseRecord[]): EligibilityResult {
  const tenDayCount = countCompleted(history, "10-day");
  const twentyDayCount = countCompleted(history, "20-day");
  const thirtyDayCount = countCompleted(history, "30-day");
  const fortyFiveDayCount = countCompleted(history, "45-day");
  const hasSatipatthana = hasCompleted(history, "satipatthana");
  const hasService = hasCompleted(history, "service");

  switch (courseType) {
    case "10-day":
      return {
        eligible: true,
        reason: "10-day courses are open to all.",
        nextCourses: ["10-day"],
        currentPhase: "Base",
      };

    case "satipatthana":
      if (tenDayCount >= 5 && hasService) {
        return {
          eligible: true,
          reason: "You meet Phase 1 requirements: 5+ ten-day courses and Dhamma Service.",
          nextCourses: ["satipatthana"],
          currentPhase: "Phase 1",
        };
      }
      return {
        eligible: false,
        reason: `Phase 1 requires at least 5 completed 10-day courses (you have ${tenDayCount}) and Dhamma Service (${hasService ? "completed" : "not completed"}).`,
        nextCourses: tenDayCount < 5 ? ["10-day"] : ["service"],
        currentPhase: "Base",
      };

    case "20-day":
      if (tenDayCount >= 5 && hasService && hasSatipatthana) {
        return {
          eligible: true,
          reason: "You meet Phase 2 requirements.",
          nextCourses: ["20-day"],
          currentPhase: "Phase 2",
        };
      }
      return {
        eligible: false,
        reason: `Phase 2 requires Phase 1 completion: 5+ ten-day courses (${tenDayCount}), Dhamma Service (${hasService ? "✓" : "✗"}), Satipatthana (${hasSatipatthana ? "✓" : "✗"}).`,
        nextCourses: !hasSatipatthana ? ["satipatthana"] : ["10-day"],
        currentPhase: "Phase 1",
      };

    case "30-day":
      if (twentyDayCount >= 1 && tenDayCount >= 6) {
        return {
          eligible: true,
          reason: "You meet Phase 2 Long-term requirements: 20-day course + refresher 10-day completed.",
          nextCourses: ["30-day"],
          currentPhase: "Phase 2",
        };
      }
      return {
        eligible: false,
        reason: `30-day requires a completed 20-day course (${twentyDayCount >= 1 ? "✓" : "✗"}) and a 10-day refresher after it (total 10-day: ${tenDayCount}).`,
        nextCourses: twentyDayCount < 1 ? ["20-day"] : ["10-day"],
        currentPhase: "Phase 2",
      };

    case "45-day":
      // Phase 3 Intermediate → Phase 4 Advanced
      if (thirtyDayCount >= 2 && tenDayCount >= 8 && hasService) {
        return {
          eligible: true,
          reason: "You meet Phase 4 requirements: 2x 30-day courses, 3+ additional 10-day courses with Service.",
          nextCourses: ["45-day"],
          currentPhase: "Phase 4",
        };
      }
      return {
        eligible: false,
        reason: `45-day requires Phase 3 completion: 2x 30-day courses (${thirtyDayCount}/2), 8+ total 10-day courses (${tenDayCount}/8), and Dhamma Service (${hasService ? "✓" : "✗"}).`,
        nextCourses: thirtyDayCount < 2 ? ["30-day"] : tenDayCount < 8 ? ["10-day"] : ["service"],
        currentPhase: "Phase 3",
      };

    case "60-day":
      if (fortyFiveDayCount >= 2) {
        return {
          eligible: true,
          reason: "You meet Phase 4 Advanced requirements: 2x 45-day courses completed.",
          nextCourses: ["60-day"],
          currentPhase: "Phase 4",
        };
      }
      return {
        eligible: false,
        reason: `60-day course requires 2 completed 45-day courses (you have ${fortyFiveDayCount}).`,
        nextCourses: ["45-day"],
        currentPhase: "Phase 4",
      };

    case "service":
      if (tenDayCount >= 1) {
        return {
          eligible: true,
          reason: "You can serve after completing at least one 10-day course.",
          nextCourses: ["service"],
          currentPhase: "Base",
        };
      }
      return {
        eligible: false,
        reason: "Dhamma Service requires at least one completed 10-day course.",
        nextCourses: ["10-day"],
        currentPhase: "Base",
      };

    default:
      return {
        eligible: false,
        reason: "Unknown course type.",
        nextCourses: ["10-day"],
        currentPhase: "Unknown",
      };
  }
}

export function getPhaseInfo(history: CourseRecord[]): {
  phase: string;
  completedCourses: number;
  progress: number;
} {
  const tenDayCount = countCompleted(history, "10-day");
  const twentyDayCount = countCompleted(history, "20-day");
  const thirtyDayCount = countCompleted(history, "30-day");
  const fortyFiveDayCount = countCompleted(history, "45-day");
  const sixtyDayCount = countCompleted(history, "60-day");
  const hasSatipatthana = hasCompleted(history, "satipatthana");
  const hasService = hasCompleted(history, "service");

  const total = history.filter((c) => c.completed).length;

  if (sixtyDayCount >= 1) return { phase: "Phase 4 - Complete", completedCourses: total, progress: 100 };
  if (fortyFiveDayCount >= 2) return { phase: "Phase 4 - Advanced", completedCourses: total, progress: 90 };
  if (fortyFiveDayCount >= 1) return { phase: "Phase 4 - In Progress", completedCourses: total, progress: 80 };
  if (thirtyDayCount >= 2) return { phase: "Phase 3 - Intermediate", completedCourses: total, progress: 65 };
  if (thirtyDayCount >= 1) return { phase: "Phase 2 - Long-term", completedCourses: total, progress: 50 };
  if (twentyDayCount >= 1) return { phase: "Phase 2 - In Progress", completedCourses: total, progress: 40 };
  if (hasSatipatthana) return { phase: "Phase 1 - Complete", completedCourses: total, progress: 30 };
  if (tenDayCount >= 5 && hasService) return { phase: "Phase 1 - Ready", completedCourses: total, progress: 25 };
  if (tenDayCount >= 1) return { phase: "Base - Active", completedCourses: total, progress: Math.min(20, tenDayCount * 4) };
  return { phase: "New Student", completedCourses: 0, progress: 0 };
}
