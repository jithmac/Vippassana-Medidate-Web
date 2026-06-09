"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  User,
  HeartPulse,
  Users,
  Briefcase,
  ClipboardList,
  Check,
  AlertTriangle,
  Download,
  Calendar,
  BookOpen
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import PhoneInput from "@/components/PhoneInput";
import { useAuthStore } from "@/store/auth";
import { validatePhone } from "@/lib/phone-validation";

interface CourseSchedule {
  id: string;
  courseType: string;
  centerName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm transition-all duration-300";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";
const checkboxClass = "w-4 h-4 rounded border-sand text-saffron accent-saffron cursor-pointer";

export default function ApplyPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [availableCourses, setAvailableCourses] = useState<CourseSchedule[]>([]);
  const [eligibleCourseTypes, setEligibleCourseTypes] = useState<string[]>([]);
  const [waitingPeriodActive, setWaitingPeriodActive] = useState(false);
  const [daysUntilEligible, setDaysUntilEligible] = useState(0);

  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [maxDate, setMaxDate] = useState("");

  const [isNewSystemUser, setIsNewSystemUser] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

  // Section: Course Selection
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Section: History (Manual overrides)
  const [manual10DayCount, setManual10DayCount] = useState("0");
  const [manual20DayCount, setManual20DayCount] = useState("0");
  const [manual30DayCount, setManual30DayCount] = useState("0");
  const [lastCourseEndDate, setLastCourseEndDate] = useState("");
  const [previousTeacherId, setPreviousTeacherId] = useState("");

  // Section: Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportOrNIC, setPassportOrNIC] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [pregnancyStatus, setPregnancyStatus] = useState("N/A");
  const [pregnancyMonths, setPregnancyMonths] = useState("");
  const [sinhalaProficiency, setSinhalaProficiency] = useState("NONE");

  // Section: Medical Info
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [hasDepression, setHasDepression] = useState(false);
  const [hasAnxiety, setHasAnxiety] = useState(false);
  const [hasEpilepsy, setHasEpilepsy] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [hasBackProblems, setHasBackProblems] = useState(false);
  const [hasHighBloodPressure, setHasHighBloodPressure] = useState(false);
  const [hasHepatitis, setHasHepatitis] = useState(false);
  const [hasTuberculosis, setHasTuberculosis] = useState(false);
  const [hasTyphoid, setHasTyphoid] = useState(false);
  const [hasOtherInfectious, setHasOtherInfectious] = useState(false);
  const [hasSchizophrenia, setHasSchizophrenia] = useState(false);
  const [usesDrugs, setUsesDrugs] = useState(false);
  const [drugDetails, setDrugDetails] = useState("");
  const [otherConditions, setOtherConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("");

  // Section: Family Info
  const [maritalStatus, setMaritalStatus] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [dependentsCount, setDependentsCount] = useState("0");
  const [nextOfKinName, setNextOfKinName] = useState("");
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState("");
  const [nextOfKinContact, setNextOfKinContact] = useState("");
  const [familyAware, setFamilyAware] = useState(false);
  const [familyHealthHistory, setFamilyHealthHistory] = useState("");
  const [familyInvolved, setFamilyInvolved] = useState(false);
  const [familyMemberName, setFamilyMemberName] = useState("");

  // Section: Occupational & Practice Info
  const [occupation, setOccupation] = useState("");
  const [employer, setEmployer] = useState("");
  const [employerContact, setEmployerContact] = useState("");
  const [reasonForAttending, setReasonForAttending] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [howHeardAboutUs, setHowHeardAboutUs] = useState("");
  const [dailyPractice, setDailyPractice] = useState(false);
  const [practiceHoursPerDay, setPracticeHoursPerDay] = useState("0");
  const [followsFivePrecepts, setFollowsFivePrecepts] = useState(false);
  const [practiceDetails, setPracticeDetails] = useState("");
  const [pastMeditationPractices, setPastMeditationPractices] = useState("");
  const [referredByPerson, setReferredByPerson] = useState("");
  const [disciplineDeclaration, setDisciplineDeclaration] = useState(false);
  const [finalInstructions, setFinalInstructions] = useState(false);

  useEffect(() => {
    checkAuth();
    setMaxDate(new Date().toISOString().split("T")[0]);
  }, [checkAuth]);

  useEffect(() => {
    if (!user && !useAuthStore.getState().loading) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      let hasPersonalInfo = false;
      if (user.personalInfo) {
        try {
          const pInfo = JSON.parse(user.personalInfo);
          if (pInfo && Object.keys(pInfo).length > 0) {
            hasPersonalInfo = true;
            if (pInfo.firstName) setFirstName(pInfo.firstName);
            if (pInfo.lastName) setLastName(pInfo.lastName);
            if (pInfo.dateOfBirth) setDateOfBirth(pInfo.dateOfBirth);
            if (pInfo.gender) setGender(pInfo.gender);
            if (pInfo.educationLevel) setEducationLevel(pInfo.educationLevel);
            if (pInfo.nationality) setNationality(pInfo.nationality);
            if (pInfo.passportOrNIC) setPassportOrNIC(pInfo.passportOrNIC);
            if (pInfo.address) setAddress(pInfo.address);
            if (pInfo.city) setCity(pInfo.city);
            if (pInfo.country) setCountry(pInfo.country);
            if (pInfo.phoneNumber) setPhoneNumber(pInfo.phoneNumber);
            if (pInfo.email) setEmail(pInfo.email);
            if (pInfo.emergencyContact) setEmergencyContact(pInfo.emergencyContact);
            if (pInfo.emergencyPhone) setEmergencyPhone(pInfo.emergencyPhone);
            if (pInfo.pregnancyStatus) setPregnancyStatus(pInfo.pregnancyStatus);
            if (pInfo.pregnancyMonths) setPregnancyMonths(pInfo.pregnancyMonths);
            if (pInfo.sinhalaProficiency) setSinhalaProficiency(pInfo.sinhalaProficiency);
            if (pInfo.languagesSpoken) setLanguagesSpoken(pInfo.languagesSpoken);
          }
        } catch (e) {
          console.error("Failed to parse user.personalInfo:", e);
        }
      }

      if (!hasPersonalInfo) {
        if (user.name && !firstName && !lastName) {
          const parts = user.name.split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (user.phone && !phoneNumber) setPhoneNumber(user.phone);
        if (user.idPassportNumber && !passportOrNIC) setPassportOrNIC(user.idPassportNumber);
      }

      fetch("/api/student/eligibility")
        .then((res) => res.json())
        .then((data) => {
          if (data.eligibleCourses) {
            setEligibleCourseTypes(data.eligibleCourses);
            setWaitingPeriodActive(data.waitingPeriodActive);
            setDaysUntilEligible(data.daysUntilEligible);
            if (data.lastCompletionDate === null) {
              setIsNewSystemUser(true);
            } else {
              setIsNewSystemUser(false);
              if (data.lastCompletionDate) {
                const formattedDate = data.lastCompletionDate.split("T")[0];
                setLastCourseEndDate(formattedDate);
              }
              if (data.completed10DayCount !== undefined) setManual10DayCount(data.completed10DayCount.toString());
              if (data.completed20DayCount !== undefined) setManual20DayCount(data.completed20DayCount.toString());
              if (data.completed30DayCount !== undefined) setManual30DayCount(data.completed30DayCount.toString());
            }
          }
        })
        .catch(console.error);

      fetch("/api/courses")
        .then((res) => res.json())
        .then((data) => {
          if (data.courses) setAvailableCourses(data.courses);
        })
        .catch(console.error);

      fetch("/api/teachers")
        .then((res) => res.json())
        .then((data) => {
          if (data.teachers) setTeachers(data.teachers);
        })
        .catch(console.error);
    }
  }, [user]);

  const isUnder18 = dateOfBirth ? Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / 3.15576e+10) < 18 : false;

  const getFilteredCourses = () => {
    let eligible = eligibleCourseTypes;
    if (isNewSystemUser) {
      if (!lastCourseEndDate) {
        eligible = ["10-day"];
      } else {
        const timeDiff = new Date().getTime() - new Date(lastCourseEndDate).getTime();
        const daysSince = Math.floor(timeDiff / (1000 * 3600 * 24));
        const hasWaited = daysSince >= 10;
        if (!hasWaited) {
          eligible = ["Dhamma Sewa"];
        } else {
          eligible = ["10-day", "Dhamma Sewa"];
          const count10 = parseInt(manual10DayCount) || 0;
          const count20 = parseInt(manual20DayCount) || 0;
          if (count10 >= 5) eligible.push("20-day");
          if (count10 >= 6 && count20 >= 1) eligible.push("30-day");
        }
      }
    }
    return availableCourses.filter(c => eligible.includes(c.courseType));
  };

  const getPages = () => {
    if (isNewSystemUser) {
      return [
        { id: "history", icon: Calendar, label: "History" },
        { id: "course", icon: ClipboardList, label: "Course" },
        { id: "identity", icon: User, label: "Identity" },
        { id: "medical", icon: HeartPulse, label: "Health" },
        { id: "family", icon: Users, label: "Family" },
        { id: "practice", icon: BookOpen, label: "Practice" },
        { id: "summary", icon: ClipboardList, label: "Summary" },
      ];
    }
    return [
      { id: "course", icon: ClipboardList, label: "Course" },
      { id: "identity", icon: User, label: "Identity" },
      { id: "medical", icon: HeartPulse, label: "Health" },
      { id: "history", icon: Calendar, label: "History" },
      { id: "family", icon: Users, label: "Family" },
      { id: "practice", icon: BookOpen, label: "Practice" },
      { id: "summary", icon: ClipboardList, label: "Summary" },
    ];
  };

  const PAGES = getPages();
  const currentPageId = PAGES[pageIndex].id;

  const handleNextStep = () => {
    setSubmitError("");
    
    if (currentPageId === "history") {
      if (lastCourseEndDate && new Date(lastCourseEndDate) > new Date()) {
        setSubmitError("Last course end date cannot be in the future.");
        return;
      }
      
      const count10 = parseInt(manual10DayCount) || 0;
      const count20 = parseInt(manual20DayCount) || 0;
      const count30 = parseInt(manual30DayCount) || 0;
      const hasCompletedCourses = !isNewSystemUser || (count10 + count20 + count30) > 0 || !!lastCourseEndDate;

      if (hasCompletedCourses && !previousTeacherId) {
        setSubmitError("Selecting your previous teacher is required.");
        return;
      }
    } else if (currentPageId === "course") {
      if (!selectedCourseId) {
        setSubmitError("Please select a course to continue.");
        return;
      }
    } else if (currentPageId === "identity") {
      if (!firstName.trim() || !lastName.trim() || !dateOfBirth || !gender || !nationality || !passportOrNIC.trim() || !address.trim() || !city.trim() || !country.trim() || !phoneNumber.trim() || !email.trim() || !emergencyContact.trim() || !emergencyPhone.trim()) {
        setSubmitError("Please fill out all required fields on this page.");
        return;
      }
      
      const age = dateOfBirth ? Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / 3.15576e+10) : 0;
      if (age < 18 || age > 80) {
        setSubmitError("Applicant must be between 18 and 80 years of age to apply.");
        return;
      }

      if (!validatePhone(phoneNumber)) {
        setSubmitError("Please enter a valid phone number.");
        return;
      }
      if (!validatePhone(emergencyPhone)) {
        setSubmitError("Please enter a valid emergency phone number.");
        return;
      }
    } else if (currentPageId === "family") {
      if (!nextOfKinName.trim() || !nextOfKinRelationship.trim() || !nextOfKinContact.trim()) {
        setSubmitError("Please provide next of kin details.");
        return;
      }
    } else if (currentPageId === "practice") {
      if (!disciplineDeclaration || !finalInstructions) {
        setSubmitError("You must accept the declarations to proceed.");
        return;
      }
    }
    
    setPageIndex(Math.min(PAGES.length - 1, pageIndex + 1));
  };

  const saveDraft = async () => {
    try {
      const selectedCourse = availableCourses.find(c => c.id === selectedCourseId);
      
      const payload = {
        id: applicationId || undefined,
        courseId: selectedCourseId,
        courseType: selectedCourse?.courseType || "10-day",
        status: "DRAFT",
        personalInfo: {
          firstName, lastName, dateOfBirth, gender, educationLevel, nationality,
          passportOrNIC, address, city, country, phoneNumber, email,
          emergencyContact, emergencyPhone, pregnancyStatus, pregnancyMonths,
          sinhalaProficiency, languagesSpoken
        },
        medicalInfo: {
          hasDiabetes, hasHeartCondition, hasDepression, hasAnxiety, hasEpilepsy,
          hasAsthma, hasBackProblems, hasHighBloodPressure, hasHepatitis,
          hasTuberculosis, hasTyphoid, hasOtherInfectious, hasSchizophrenia,
          usesDrugs, drugDetails, otherConditions, currentMedications, dietaryRequirements
        },
        familyInfo: {
          maritalStatus, spouseName, dependentsCount, nextOfKinName,
          nextOfKinRelationship, nextOfKinContact, familyAware, familyHealthHistory,
          familyInvolved, familyMemberName
        },
        occupationalInfo: {
          occupation, employer, employerContact, reasonForAttending, specialRequests,
          howHeardAboutUs, dailyPractice, practiceHoursPerDay, followsFivePrecepts,
          practiceDetails, pastMeditationPractices, referredByPerson, disciplineDeclaration,
          finalInstructions
        },
        courseHistory: JSON.stringify([{
          manual10DayCount, manual20DayCount, manual30DayCount,
          lastCourseEndDate, previousTeacherId,
        }])
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setApplicationId(data.application.id);
        return data.application.id;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleDownloadPdf = async () => {
    setSubmitting(true);
    setSubmitError("");
    
    const savedId = await saveDraft();
    if (savedId) {
      window.open(`/api/applications/${savedId}/pdf`, '_blank');
      setPdfDownloaded(true);
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId, pdfDownloaded: true }),
      });
    } else {
      setSubmitError("Failed to save draft before generating PDF.");
    }
    
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    const savedId = await saveDraft();
    if (!savedId) {
      setSubmitError("Failed to submit application.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: savedId,
          status: "PENDING"
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Submission failed");
      } else {
        setSubmitSuccess(true);
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    }

    setSubmitting(false);
  };

  if (!user) return null;

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ZenBackground />
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 bg-white/70 backdrop-blur-sm rounded-2xl border border-saffron/20 p-12 text-center max-w-lg"
          >
            <div className="w-16 h-16 rounded-full bg-saffron/20 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-saffron" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3 lining-nums">Application Submitted</h2>
            <p className="text-warm-gray mb-2">
              Your application has been received and is currently under review by the Dhamma team.
            </p>
            <p className="text-sm text-saffron-dark mb-8">An SMS notification has been sent to your phone.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 rounded-xl bg-saffron text-cream font-medium text-sm hover:bg-saffron-dark transition-all duration-500"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      <div className="flex-1 relative z-10 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Progress Steps */}
        <div className="flex flex-nowrap items-center justify-start sm:justify-center gap-0.5 mb-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full px-1">
          {PAGES.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="flex items-center shrink-0">
                <button
                  onClick={() => i < pageIndex ? setPageIndex(i) : null}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-500 shrink-0 ${
                    i === pageIndex
                      ? "bg-saffron text-cream"
                      : i < pageIndex
                        ? "bg-saffron/20 text-saffron-dark cursor-pointer"
                        : "bg-sand/30 text-warm-gray cursor-not-allowed"
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{p.label}</span>
                </button>
                {i < PAGES.length - 1 && (
                  <div className={`w-2 sm:w-3 h-px mx-0.5 shrink-0 ${i < pageIndex ? "bg-saffron" : "bg-sand"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sand/50 p-6 sm:p-8 shadow-lg shadow-saffron/5"
          >
            {/* HISTORY PAGE */}
            {currentPageId === "history" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1 lining-nums">Course History</h2>
                  <p className="text-sm text-warm-gray">
                    {isNewSystemUser
                      ? "As a new user to our system, please provide your past course counts to determine eligibility."
                      : "Please confirm details of the last course you attended."}
                  </p>
                </div>

                {isNewSystemUser && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>10-Day Courses</label>
                      <input type="number" value={manual10DayCount} onChange={(e) => setManual10DayCount(e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>20-Day Courses</label>
                      <input type="number" value={manual20DayCount} onChange={(e) => setManual20DayCount(e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>30-Day Courses</label>
                      <input type="number" value={manual30DayCount} onChange={(e) => setManual30DayCount(e.target.value)} className={inputClass} min="0" />
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>End Date of Last Course</label>
                    <input type="date" value={lastCourseEndDate} onChange={(e) => setLastCourseEndDate(e.target.value)} max={maxDate} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Previous Teacher</label>
                    <select value={previousTeacherId} onChange={(e) => setPreviousTeacherId(e.target.value)} className={inputClass}>
                      <option value="">Select...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* COURSE PAGE */}
            {currentPageId === "course" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1 lining-nums">Course Selection</h2>
                  <p className="text-sm text-warm-gray">Select an available course based on your eligibility.</p>
                </div>

                {!isNewSystemUser && waitingPeriodActive && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center mb-6">
                    <AlertTriangle className="mx-auto text-orange-500 mb-3" size={32} />
                    <h3 className="font-medium text-orange-800 mb-2">Waiting Period Active</h3>
                    <p className="text-sm text-orange-700">
                      You recently completed a course. You are only eligible to apply for Dhamma Sewa for the next {daysUntilEligible} days.
                    </p>
                  </div>
                )}

                {getFilteredCourses().length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                    <h3 className="font-medium text-blue-800 mb-2">No Eligible Courses Available</h3>
                    <p className="text-sm text-blue-700">
                      There are currently no courses scheduled that match your eligibility criteria. Please check back later.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Select Course</label>
                    <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className={inputClass}>
                      <option value="">Select a course...</option>
                      {getFilteredCourses().map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.courseType} at {c.centerName} ({c.startDate} to {c.endDate}) - {c.capacity - c.enrolled} spots left
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* IDENTITY PAGE */}
            {currentPageId === "identity" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1 lining-nums">Personal Identity</h2>
                  <p className="text-sm text-warm-gray">Verify your profile details and provide emergency contacts.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="First name" />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="Last name" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <div className="flex gap-2">
                      <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={maxDate} className={inputClass} />
                      {dateOfBirth && (
                        <div className={`flex items-center px-4 rounded-xl border text-sm whitespace-nowrap ${isUnder18 ? 'bg-red-50 border-red-200 text-red-600' : 'border-sand bg-cream/50 text-warm-gray'}`}>
                          {Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / 3.15576e+10)} yrs
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nationality</label>
                    <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} placeholder="e.g. Sri Lankan" />
                  </div>
                  <div>
                    <label className={labelClass}>Passport / NIC Number</label>
                    <input type="text" value={passportOrNIC} onChange={(e) => setPassportOrNIC(e.target.value)} className={inputClass} placeholder="ID number" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Your full address" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="City" />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <PhoneInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    required
                  />
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Languages Spoken</label>
                    <input type="text" value={languagesSpoken} onChange={(e) => setLanguagesSpoken(e.target.value)} className={inputClass} placeholder="e.g. English, Sinhala" />
                  </div>
                  <div>
                    <label className={labelClass}>Education Level</label>
                    <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className={inputClass}>
                      <option value="">Select...</option>
                      <option value="O/L">O/L</option>
                      <option value="A/L">A/L</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Completed degree">Completed degree</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Emergency Contact Name</label>
                    <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className={inputClass} placeholder="Contact name" />
                  </div>
                  <PhoneInput
                    label="Emergency Contact Phone"
                    value={emergencyPhone}
                    onChange={setEmergencyPhone}
                    required
                  />
                </div>

                {gender === "Female" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Pregnancy Status</label>
                      <select value={pregnancyStatus} onChange={(e) => setPregnancyStatus(e.target.value)} className={inputClass}>
                        <option value="N/A">Not Applicable</option>
                        <option value="Not Pregnant">Not Pregnant</option>
                        <option value="Pregnant">Pregnant</option>
                      </select>
                    </div>
                    {pregnancyStatus === "Pregnant" && (
                      <div>
                        <label className={labelClass}>How far along? (Months)</label>
                        <input type="text" value={pregnancyMonths} onChange={(e) => setPregnancyMonths(e.target.value)} className={inputClass} placeholder="e.g. 5 months" />
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label className={labelClass}>Sinhala Proficiency</label>
                  <select value={sinhalaProficiency} onChange={(e) => setSinhalaProficiency(e.target.value)} className={inputClass}>
                    <option value="NONE">None</option>
                    <option value="BASIC">Basic</option>
                    <option value="CONVERSATIONAL">Conversational</option>
                    <option value="FLUENT">Fluent</option>
                  </select>
                </div>
              </div>
            )}

            {/* MEDICAL INFO PAGE */}
            {currentPageId === "medical" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1 lining-nums">Medical Info</h2>
                  <p className="text-sm text-warm-gray">This information helps us ensure your safety during the course.</p>
                </div>

                <div className="bg-cream-dark/50 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4">Physical Conditions</h3>
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "Diabetes", state: hasDiabetes, setter: setHasDiabetes },
                      { label: "Heart Condition", state: hasHeartCondition, setter: setHasHeartCondition },
                      { label: "Epilepsy", state: hasEpilepsy, setter: setHasEpilepsy },
                      { label: "Asthma", state: hasAsthma, setter: setHasAsthma },
                      { label: "Back Problems", state: hasBackProblems, setter: setHasBackProblems },
                      { label: "High Blood Pressure", state: hasHighBloodPressure, setter: setHasHighBloodPressure },
                      { label: "Hepatitis", state: hasHepatitis, setter: setHasHepatitis },
                      { label: "Tuberculosis", state: hasTuberculosis, setter: setHasTuberculosis },
                      { label: "Typhoid", state: hasTyphoid, setter: setHasTyphoid },
                      { label: "Other Infectious", state: hasOtherInfectious, setter: setHasOtherInfectious },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors">
                        <input type="checkbox" checked={item.state} onChange={(e) => item.setter(e.target.checked)} className={checkboxClass} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <h3 className="text-sm font-medium text-foreground mb-4 border-t border-sand/50 pt-4">Mental Conditions</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: "Depression", state: hasDepression, setter: setHasDepression },
                      { label: "Anxiety Disorder", state: hasAnxiety, setter: setHasAnxiety },
                      { label: "Schizophrenia", state: hasSchizophrenia, setter: setHasSchizophrenia },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors">
                        <input type="checkbox" checked={item.state} onChange={(e) => item.setter(e.target.checked)} className={checkboxClass} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-cream-dark/50 rounded-xl p-5 border border-sand/50">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={usesDrugs} onChange={(e) => setUsesDrugs(e.target.checked)} className={checkboxClass} />
                    <span className="text-sm font-medium text-foreground">Are you using any drugs like heroin, barbiturates, cocaine, cannabis?</span>
                  </label>
                  {usesDrugs && (
                    <div className="mt-4">
                      <label className={labelClass}>Please provide details</label>
                      <textarea value={drugDetails} onChange={(e) => setDrugDetails(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Types, frequency, duration..." />
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Other Medical Conditions</label>
                  <textarea value={otherConditions} onChange={(e) => setOtherConditions(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Please describe any other conditions..." />
                </div>

                <div>
                  <label className={labelClass}>Current Medications</label>
                  <textarea value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="List any medications you are currently taking..." />
                </div>

                <div>
                  <label className={labelClass}>Dietary Requirements</label>
                  <input type="text" value={dietaryRequirements} onChange={(e) => setDietaryRequirements(e.target.value)} className={inputClass} placeholder="e.g. Vegetarian, Vegan, Allergies..." />
                </div>
              </div>
            )}

            {/* FAMILY INFO PAGE */}
            {currentPageId === "family" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1 lining-nums">Family Info</h2>
                  <p className="text-sm text-warm-gray">Tell us about your family background.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={inputClass}>
                      <option value="">Select...</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Number of Dependents</label>
                    <input type="number" value={dependentsCount} onChange={(e) => setDependentsCount(e.target.value)} className={inputClass} min="0" />
                  </div>
                </div>

                {maritalStatus === "Married" && (
                  <div>
                    <label className={labelClass}>Spouse / Partner Name</label>
                    <input type="text" value={spouseName} onChange={(e) => setSpouseName(e.target.value)} className={inputClass} placeholder="Spouse name" />
                  </div>
                )}

                <div className="bg-cream-dark/50 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4">Next of Kin Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input type="text" value={nextOfKinName} onChange={(e) => setNextOfKinName(e.target.value)} className={inputClass} placeholder="Full name" />
                    </div>
                    <div>
                      <label className={labelClass}>Relationship</label>
                      <input type="text" value={nextOfKinRelationship} onChange={(e) => setNextOfKinRelationship(e.target.value)} className={inputClass} placeholder="e.g. Mother, Brother" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Contact Number</label>
                    <input type="text" value={nextOfKinContact} onChange={(e) => setNextOfKinContact(e.target.value)} className={inputClass} placeholder="+123..." />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={familyAware} onChange={(e) => setFamilyAware(e.target.checked)} className={checkboxClass} />
                  <span className="text-sm text-foreground">My family is aware of my attendance at this course</span>
                </label>

                <div>
                  <label className={labelClass}>Relevant Family Health History</label>
                  <textarea value={familyHealthHistory} onChange={(e) => setFamilyHealthHistory(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Any hereditary conditions?" />
                </div>
                
                <div className="bg-saffron/5 rounded-xl p-5 border border-saffron/10">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={familyInvolved} onChange={(e) => setFamilyInvolved(e.target.checked)} className={checkboxClass} />
                    <span className="text-sm font-medium text-foreground">Are husband/wife or other family members involved in this program?</span>
                  </label>
                  {familyInvolved && (
                    <div>
                      <label className={labelClass}>Name of the person</label>
                      <input type="text" value={familyMemberName} onChange={(e) => setFamilyMemberName(e.target.value)} className={inputClass} placeholder="Family member's name" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OCCUPATIONAL & PRACTICE PAGE */}
            {currentPageId === "practice" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1 lining-nums">Occupational & Practice Info</h2>
                  <p className="text-sm text-warm-gray">Your occupation, practice history, and declarations.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Occupation / Job Title</label>
                    <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass} placeholder="Your occupation" />
                  </div>
                  <div>
                    <label className={labelClass}>Employer / Organization</label>
                    <input type="text" value={employer} onChange={(e) => setEmployer(e.target.value)} className={inputClass} placeholder="Employer name" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Employer Contact (for emergency use)</label>
                  <input type="text" value={employerContact} onChange={(e) => setEmployerContact(e.target.value)} className={inputClass} placeholder="HR or Manager contact" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Reason for attending</label>
                    <textarea value={reasonForAttending} onChange={(e) => setReasonForAttending(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Why do you wish to attend?" />
                  </div>
                  <div>
                    <label className={labelClass}>Special Requests</label>
                    <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Any accessibility needs?" />
                  </div>
                </div>

                <div className="bg-cream-dark/50 rounded-xl p-5 border border-sand/50">
                  <h3 className="text-sm font-medium text-foreground mb-4">Meditation Practice</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={dailyPractice} onChange={(e) => setDailyPractice(e.target.checked)} className={checkboxClass} />
                    <span className="text-sm font-medium text-foreground">Do you practice daily?</span>
                  </label>
                  
                  {dailyPractice && (
                    <div className="mb-4">
                      <label className={labelClass}>Hours per day</label>
                      <input type="number" value={practiceHoursPerDay} onChange={(e) => setPracticeHoursPerDay(e.target.value)} className={inputClass} min="0" step="0.5" />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input type="checkbox" checked={followsFivePrecepts} onChange={(e) => setFollowsFivePrecepts(e.target.checked)} className={checkboxClass} />
                    <span className="text-sm font-medium text-foreground">Do you follow the Five Precepts?</span>
                  </label>

                  <div className="grid gap-4">
                    <div>
                      <label className={labelClass}>Practice Details</label>
                      <textarea value={practiceDetails} onChange={(e) => setPracticeDetails(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Describe your current practice..." />
                    </div>
                    <div>
                      <label className={labelClass}>Past Meditation Practices</label>
                      <textarea value={pastMeditationPractices} onChange={(e) => setPastMeditationPractices(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Any other techniques you have practiced?" />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Referred By</label>
                    <input type="text" value={referredByPerson} onChange={(e) => setReferredByPerson(e.target.value)} className={inputClass} placeholder="Name of person" />
                  </div>
                  <div>
                    <label className={labelClass}>How did you hear about us?</label>
                    <input type="text" value={howHeardAboutUs} onChange={(e) => setHowHeardAboutUs(e.target.value)} className={inputClass} placeholder="e.g. Friend, Website" />
                  </div>
                </div>

                <div className="bg-saffron/5 rounded-xl p-5 border border-saffron/10 space-y-4">
                  <h3 className="font-serif text-base font-semibold text-foreground">Declarations</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disciplineDeclaration}
                      onChange={(e) => setDisciplineDeclaration(e.target.checked)}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-foreground">I agree to observe the Code of Discipline and Five Precepts.</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={finalInstructions}
                      onChange={(e) => setFinalInstructions(e.target.checked)}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-foreground">I agree to abide by the course rules and remain for the full duration.</span>
                  </label>
                </div>
              </div>
            )}

            {/* SUMMARY PAGE */}
            {currentPageId === "summary" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1 lining-nums">Application Summary</h2>
                  <p className="text-sm text-warm-gray">Review your details and submit.</p>
                </div>

                <div className="bg-cream-dark/50 rounded-xl p-5">
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <p><span className="text-warm-gray">Name:</span> <span className="font-medium text-foreground">{firstName} {lastName}</span></p>
                    <p><span className="text-warm-gray">ID:</span> <span className="font-medium text-foreground">{passportOrNIC}</span></p>
                    <p><span className="text-warm-gray">Course:</span> <span className="font-medium text-foreground">
                      {availableCourses.find(c => c.id === selectedCourseId)?.courseType || "Not selected"}
                    </span></p>
                    <p><span className="text-warm-gray">Phone:</span> <span className="font-medium text-foreground">{phoneNumber}</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-saffron text-saffron font-medium hover:bg-saffron/5 transition-all duration-300 w-full"
                  >
                    <Download size={18} />
                    Download PDF Copy
                  </button>
                  <p className="text-xs text-center text-warm-gray">You can download a PDF copy before submitting.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Global Error Display */}
        {submitError && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand text-warm-gray text-sm font-medium hover:bg-white/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {pageIndex < PAGES.length - 1 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !pdfDownloaded}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-monk-red text-cream text-sm font-medium hover:bg-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!pdfDownloaded ? "Please download the PDF copy first" : ""}
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
