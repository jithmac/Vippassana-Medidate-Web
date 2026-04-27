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
  BookOpen,
  Calendar,
  ClipboardList,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";

const CENTERS = [
  "Dhamma Maneeratta",
  "Dhamma Mowbray",
  "Dhamma Kuta",
  "Dhamma Sobha",
  "Dhamma Aloka",
];

const COURSE_TYPES = [
  { value: "10-day", label: "10-Day Course (Introductory)" },
  { value: "20-day", label: "20-Day Course" },
  { value: "30-day", label: "30-Day Course" },
  { value: "45-day", label: "45-Day Course" },
  { value: "60-day", label: "60-Day Course" },
  { value: "satipatthana", label: "Satipatthana Course" },
  { value: "service", label: "Dhamma Service" },
];

const PAGES = [
  { icon: User, label: "Identity" },
  { icon: HeartPulse, label: "Health" },
  { icon: BookOpen, label: "Practice" },
  { icon: Calendar, label: "History" },
  { icon: ClipboardList, label: "Summary" },
];

interface CourseHistoryEntry {
  courseType: string;
  startDate: string;
  endDate: string;
  centerName: string;
  completed: boolean;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm transition-all duration-300";
const labelClass = "block text-sm font-medium text-moss mb-1.5";
const checkboxClass =
  "w-4 h-4 rounded border-sand text-sage accent-sage cursor-pointer";

export default function ApplyPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Page 1 - Identity
  const [centerName, setCenterName] = useState("");
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
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [pregnancyStatus, setPregnancyStatus] = useState("N/A");
  const [sinhalaProficiency, setSinhalaProficiency] = useState("NONE");

  // Page 2 - Health
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [hasDepression, setHasDepression] = useState(false);
  const [hasAnxiety, setHasAnxiety] = useState(false);
  const [hasEpilepsy, setHasEpilepsy] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [hasBackProblems, setHasBackProblems] = useState(false);
  const [otherConditions, setOtherConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [disciplineDeclaration, setDisciplineDeclaration] = useState(false);

  // Page 3 - Practice
  const [dailyPractice, setDailyPractice] = useState(false);
  const [practiceHoursPerDay, setPracticeHoursPerDay] = useState("0");
  const [followsFivePrecepts, setFollowsFivePrecepts] = useState(false);
  const [practiceDetails, setPracticeDetails] = useState("");

  // Page 4 - Course History
  const [courseHistory, setCourseHistory] = useState<CourseHistoryEntry[]>([]);

  // Page 5 - Summary
  const [courseType, setCourseType] = useState("10-day");
  const [occupation, setOccupation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [howHeardAboutUs, setHowHeardAboutUs] = useState("");
  const [finalInstructions, setFinalInstructions] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user && !useAuthStore.getState().loading) {
      router.push("/login");
    }
  }, [user, router]);

  const addCourseEntry = () => {
    setCourseHistory([
      ...courseHistory,
      { courseType: "10-day", startDate: "", endDate: "", centerName: "", completed: false },
    ]);
  };

  const removeCourseEntry = (index: number) => {
    setCourseHistory(courseHistory.filter((_, i) => i !== index));
  };

  const updateCourseEntry = (index: number, field: keyof CourseHistoryEntry, value: string | boolean) => {
    const updated = [...courseHistory];
    (updated[index] as unknown as Record<string, string | boolean>)[field] = value;
    setCourseHistory(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseType,
          centerName,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          nationality,
          passportOrNIC,
          address,
          city,
          country,
          phoneNumber,
          emergencyContact,
          emergencyPhone,
          pregnancyStatus,
          sinhalaProficiency,
          hasDiabetes,
          hasHeartCondition,
          hasDepression,
          hasAnxiety,
          hasEpilepsy,
          hasAsthma,
          hasBackProblems,
          otherConditions,
          currentMedications,
          dietaryRequirements,
          disciplineDeclaration,
          dailyPractice,
          practiceHoursPerDay,
          followsFivePrecepts,
          practiceDetails,
          courseHistory: JSON.stringify(courseHistory),
          occupation,
          specialRequests,
          howHeardAboutUs,
          finalInstructions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.eligibility) {
          setSubmitError(`Not eligible: ${data.eligibility.reason}`);
        } else {
          setSubmitError(data.error || "Submission failed");
        }
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
            className="relative z-10 bg-white/70 backdrop-blur-sm rounded-2xl border border-sage/20 p-12 text-center max-w-lg"
          >
            <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-sage" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-moss mb-3">Application Submitted</h2>
            <p className="text-warm-gray mb-2">
              Your application has been received and is currently under review by the Dhamma team.
            </p>
            <p className="text-sm text-sage-dark mb-8">An SMS notification has been sent to your phone.</p>
            <button
              onClick={() => router.push("/my-applications")}
              className="px-8 py-3 rounded-xl bg-sage text-cream font-medium text-sm hover:bg-sage-dark transition-all duration-500"
            >
              View My Applications
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
        <div className="flex items-center justify-center gap-1 mb-8">
          {PAGES.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.label} className="flex items-center">
                <button
                  onClick={() => setPage(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
                    i === page
                      ? "bg-sage text-cream"
                      : i < page
                        ? "bg-sage/20 text-sage-dark"
                        : "bg-sand/30 text-warm-gray"
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{p.label}</span>
                </button>
                {i < PAGES.length - 1 && (
                  <div className={`w-6 h-px mx-1 ${i < page ? "bg-sage" : "bg-sand"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sand/50 p-6 sm:p-8 shadow-lg shadow-sage/5"
          >
            {/* PAGE 1 - Identity */}
            {page === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-moss mb-1">Personal Identity</h2>
                  <p className="text-sm text-warm-gray">Please provide your personal details accurately.</p>
                </div>

                <div>
                  <label className={labelClass}>Meditation Center</label>
                  <select
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a center...</option>
                    {CENTERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
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
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} placeholder="+94 77 123 4567" />
                  </div>
                  <div>
                    <label className={labelClass}>Emergency Contact Name</label>
                    <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className={inputClass} placeholder="Contact name" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Emergency Contact Phone</label>
                  <input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={inputClass} placeholder="+94 77 000 0000" />
                </div>

                {gender === "Female" && (
                  <div>
                    <label className={labelClass}>Pregnancy Status</label>
                    <select value={pregnancyStatus} onChange={(e) => setPregnancyStatus(e.target.value)} className={inputClass}>
                      <option value="N/A">Not Applicable</option>
                      <option value="Not Pregnant">Not Pregnant</option>
                      <option value="Pregnant">Pregnant</option>
                    </select>
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

            {/* PAGE 2 - Health & Conduct */}
            {page === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-moss mb-1">Health & Conduct</h2>
                  <p className="text-sm text-warm-gray">This information helps us ensure your safety during the course.</p>
                </div>

                <div className="bg-cream-dark/50 rounded-xl p-5">
                  <p className="text-sm font-medium text-moss mb-4">Do you have any of the following conditions?</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: "Diabetes", state: hasDiabetes, setter: setHasDiabetes },
                      { label: "Heart Condition", state: hasHeartCondition, setter: setHasHeartCondition },
                      { label: "Depression", state: hasDepression, setter: setHasDepression },
                      { label: "Anxiety Disorder", state: hasAnxiety, setter: setHasAnxiety },
                      { label: "Epilepsy", state: hasEpilepsy, setter: setHasEpilepsy },
                      { label: "Asthma", state: hasAsthma, setter: setHasAsthma },
                      { label: "Back Problems", state: hasBackProblems, setter: setHasBackProblems },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={item.state}
                          onChange={(e) => item.setter(e.target.checked)}
                          className={checkboxClass}
                        />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </label>
                    ))}
                  </div>
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

                <div className="bg-sage/5 rounded-xl p-5 border border-sage/10">
                  <h3 className="font-serif text-base font-semibold text-moss mb-3">Declaration of Discipline</h3>
                  <p className="text-xs text-warm-gray leading-relaxed mb-4">
                    I hereby declare that I will observe the five precepts throughout the duration of the course:
                    abstaining from killing any living creature, stealing, sexual misconduct, wrong speech,
                    and all intoxicants. I will follow the discipline of the course, the timetable, and the
                    instructions of the teacher. I understand that if I break these rules, I may be asked to leave.
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disciplineDeclaration}
                      onChange={(e) => setDisciplineDeclaration(e.target.checked)}
                      className={checkboxClass}
                    />
                    <span className="text-sm font-medium text-moss">
                      I agree to the Declaration of Discipline
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* PAGE 3 - Practice History */}
            {page === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-moss mb-1">Practice History</h2>
                  <p className="text-sm text-warm-gray">Tell us about your current meditation practice.</p>
                </div>

                <div className="bg-cream-dark/50 rounded-xl p-5">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={dailyPractice}
                      onChange={(e) => setDailyPractice(e.target.checked)}
                      className={checkboxClass}
                    />
                    <span className="text-sm font-medium text-moss">
                      I maintain a daily 2-hour meditation practice (1 hour morning, 1 hour evening)
                    </span>
                  </label>

                  <div>
                    <label className={labelClass}>Hours of practice per day</label>
                    <select value={practiceHoursPerDay} onChange={(e) => setPracticeHoursPerDay(e.target.value)} className={inputClass}>
                      <option value="0">None</option>
                      <option value="0.5">30 minutes</option>
                      <option value="1">1 hour</option>
                      <option value="1.5">1.5 hours</option>
                      <option value="2">2 hours</option>
                      <option value="3">3+ hours</option>
                    </select>
                  </div>
                </div>

                <div className="bg-cream-dark/50 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-moss mb-3">The Five Precepts</h3>
                  <ul className="text-xs text-warm-gray space-y-1 mb-4 ml-4 list-disc">
                    <li>Abstaining from killing any living creature</li>
                    <li>Abstaining from stealing</li>
                    <li>Abstaining from sexual misconduct</li>
                    <li>Abstaining from wrong speech</li>
                    <li>Abstaining from all intoxicants</li>
                  </ul>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={followsFivePrecepts}
                      onChange={(e) => setFollowsFivePrecepts(e.target.checked)}
                      className={checkboxClass}
                    />
                    <span className="text-sm font-medium text-moss">
                      I observe the Five Precepts in daily life
                    </span>
                  </label>
                </div>

                <div>
                  <label className={labelClass}>Additional Practice Details</label>
                  <textarea
                    value={practiceDetails}
                    onChange={(e) => setPracticeDetails(e.target.value)}
                    className={inputClass + " resize-none"}
                    rows={4}
                    placeholder="Describe your meditation practice history, any other techniques learned, retreats attended outside of Vipassana, etc."
                  />
                </div>
              </div>
            )}

            {/* PAGE 4 - Course History Table */}
            {page === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-moss mb-1">Course History</h2>
                  <p className="text-sm text-warm-gray">List all Vipassana courses you have attended. This determines your eligibility for advanced courses.</p>
                </div>

                {courseHistory.length === 0 ? (
                  <div className="text-center py-10 bg-cream-dark/30 rounded-xl border border-dashed border-sand">
                    <Calendar size={32} className="mx-auto text-sand mb-3" />
                    <p className="text-sm text-warm-gray mb-4">No course history added yet.</p>
                    <button
                      onClick={addCourseEntry}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sage text-cream text-sm font-medium hover:bg-sage-dark transition-all duration-300"
                    >
                      <Plus size={16} />
                      Add First Course
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseHistory.map((entry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-cream-dark/30 rounded-xl p-4 border border-sand/50 relative"
                      >
                        <button
                          onClick={() => removeCourseEntry(i)}
                          className="absolute top-3 right-3 p-1 rounded-lg text-warm-gray hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-moss mb-1 block">Course Type</label>
                            <select
                              value={entry.courseType}
                              onChange={(e) => updateCourseEntry(i, "courseType", e.target.value)}
                              className={inputClass}
                            >
                              {COURSE_TYPES.map((ct) => (
                                <option key={ct.value} value={ct.value}>{ct.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-moss mb-1 block">Center</label>
                            <input
                              type="text"
                              value={entry.centerName}
                              onChange={(e) => updateCourseEntry(i, "centerName", e.target.value)}
                              className={inputClass}
                              placeholder="Center name"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-moss mb-1 block">Start Date</label>
                            <input
                              type="date"
                              value={entry.startDate}
                              onChange={(e) => updateCourseEntry(i, "startDate", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-moss mb-1 block">End Date</label>
                            <input
                              type="date"
                              value={entry.endDate}
                              onChange={(e) => updateCourseEntry(i, "endDate", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={entry.completed}
                            onChange={(e) => updateCourseEntry(i, "completed", e.target.checked)}
                            className={checkboxClass}
                          />
                          <span className="text-sm text-moss">Completed successfully</span>
                        </label>
                      </motion.div>
                    ))}
                    <button
                      onClick={addCourseEntry}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-sage/40 text-sage-dark text-sm font-medium hover:bg-sage/5 transition-all duration-300"
                    >
                      <Plus size={16} />
                      Add Another Course
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PAGE 5 - Summary & Submit */}
            {page === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-moss mb-1">Course Selection & Summary</h2>
                  <p className="text-sm text-warm-gray">Select your desired course and review before submitting.</p>
                </div>

                <div>
                  <label className={labelClass}>Course Type</label>
                  <select value={courseType} onChange={(e) => setCourseType(e.target.value)} className={inputClass}>
                    {COURSE_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>{ct.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Occupation</label>
                  <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass} placeholder="Your current occupation" />
                </div>

                <div>
                  <label className={labelClass}>How did you hear about us?</label>
                  <input type="text" value={howHeardAboutUs} onChange={(e) => setHowHeardAboutUs(e.target.value)} className={inputClass} placeholder="Friend, website, social media..." />
                </div>

                <div>
                  <label className={labelClass}>Special Requests</label>
                  <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className={inputClass + " resize-none"} rows={3} placeholder="Any special needs or requests..." />
                </div>

                <div className="bg-sage/5 rounded-xl p-5 border border-sage/10">
                  <h3 className="font-serif text-base font-semibold text-moss mb-3">Final Instructions</h3>
                  <ul className="text-xs text-warm-gray space-y-1 mb-4 ml-4 list-disc">
                    <li>Arrive at the center by 2:00 PM on the start date</li>
                    <li>Bring only white clothing for the duration of the course</li>
                    <li>No electronic devices, books, or writing materials are allowed</li>
                    <li>The course runs on a strict timetable starting at 4:00 AM</li>
                    <li>All meals are vegetarian and provided by the center</li>
                  </ul>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={finalInstructions}
                      onChange={(e) => setFinalInstructions(e.target.checked)}
                      className={checkboxClass}
                    />
                    <span className="text-sm font-medium text-moss">
                      I have read and understood the instructions above
                    </span>
                  </label>
                </div>

                {/* Summary */}
                <div className="bg-cream-dark/50 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-moss mb-3">Application Summary</h3>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <p><span className="text-warm-gray">Name:</span> <span className="text-foreground font-medium">{firstName} {lastName}</span></p>
                    <p><span className="text-warm-gray">Center:</span> <span className="text-foreground font-medium">{centerName || "Not selected"}</span></p>
                    <p><span className="text-warm-gray">Course:</span> <span className="text-foreground font-medium">{COURSE_TYPES.find(c => c.value === courseType)?.label}</span></p>
                    <p><span className="text-warm-gray">Phone:</span> <span className="text-foreground font-medium">{phoneNumber || "Not provided"}</span></p>
                    <p><span className="text-warm-gray">Past Courses:</span> <span className="text-foreground font-medium">{courseHistory.length} recorded</span></p>
                    <p><span className="text-warm-gray">Discipline:</span> <span className="text-foreground font-medium">{disciplineDeclaration ? "Accepted" : "Not accepted"}</span></p>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand text-warm-gray text-sm font-medium hover:bg-white/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {page < PAGES.length - 1 ? (
            <button
              onClick={() => setPage(Math.min(PAGES.length - 1, page + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-cream text-sm font-medium hover:bg-sage-dark transition-all duration-300"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !disciplineDeclaration || !finalInstructions}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-moss text-cream text-sm font-medium hover:bg-sage-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
