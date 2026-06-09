"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  BarChart3,
  Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import StudentDashboard from "@/components/StudentDashboard";
import { useAuthStore } from "@/store/auth";

interface AppUser {
  name: string;
  email: string;
  phone: string;
}

interface Application {
  id: string;
  userId: string;
  courseType: string;
  centerName: string;
  status: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  email: string;
  civilStatus: string;
  educationLevel: string;
  languagesSpoken: string;
  emergencyContact: string;
  emergencyPhone: string;
  pregnancyStatus: string;
  pregnancyMonths: string;
  sinhalaProficiency: string;
  hasDiabetes: boolean;
  hasHeartCondition: boolean;
  hasDepression: boolean;
  hasAnxiety: boolean;
  hasEpilepsy: boolean;
  hasAsthma: boolean;
  hasBackProblems: boolean;
  hasHighBloodPressure: boolean;
  hasHepatitis: boolean;
  hasTuberculosis: boolean;
  hasTyphoid: boolean;
  hasOtherInfectious: boolean;
  hasSchizophrenia: boolean;
  usesDrugs: boolean;
  drugDetails: string;
  otherConditions: string;
  currentMedications: string;
  dietaryRequirements: string;
  
  maritalStatus: string;
  spouseName: string;
  dependentsCount: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinContact: string;
  familyAware: boolean;
  familyHealthHistory: string;

  occupation: string;
  employer: string;
  employerContact: string;
  reasonForAttending: string;
  specialRequests: string;
  dailyPractice: boolean;
  practiceHoursPerDay: string;
  followsFivePrecepts: boolean;
  practiceDetails: string;
  pastMeditationPractices: string;
  referredByPerson: string;
  disciplineDeclaration: boolean;
  finalInstructions: boolean;
  
  assistantTeacherRemarks: string;
  regionalCoordinatorRemarks: string;
  createdAt: string;
  selectedTeacherId?: string;
  courseHistory: string;
  user: AppUser;
  previousTeacherId?: string;
  newTeacherId?: string;
  areaTeacherId?: string;
  currentReviewStage?: string;
}

interface Stats {
  totalStudents: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export default function DashboardPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [rejectionModal, setRejectionModal] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [assignments, setAssignments] = useState<Record<string, { prev: string; new: string; area: string }>>({});
  const [assignmentFeedback, setAssignmentFeedback] = useState<Record<string, { type: "success" | "error"; text: string }>>({});

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, statsRes, teachersRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/admin/stats"),
        fetch("/api/teachers"),
      ]);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.teachers);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && (user.role === "TEACHER" || user.role === "ADMIN")) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleApprove = async (appId: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/applications/${appId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
    setProcessing(false);
  };

  const handleReject = async (appId: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/applications/${appId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      });
      if (res.ok) {
        await fetchData();
        setRejectionModal(null);
        setRemarks("");
      }
    } catch (err) {
      console.error("Rejection error:", err);
    }
    setProcessing(false);
  };

  const handleAssignTeachers = async (appId: string) => {
    const assign = assignments[appId];
    if (!assign?.new || !assign?.area) {
      setAssignmentFeedback(prev => ({ ...prev, [appId]: { type: "error", text: "New and Area Teachers required." } }));
      setTimeout(() => setAssignmentFeedback(prev => { const next = { ...prev }; delete next[appId]; return next; }), 3000);
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/applications/${appId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousTeacherId: assign.prev || null,
          newTeacherId: assign.new,
          areaTeacherId: assign.area,
        }),
      });
      if (res.ok) {
        await fetchData();
        setAssignmentFeedback(prev => ({ ...prev, [appId]: { type: "success", text: "Teachers assigned successfully!" } }));
      } else {
        setAssignmentFeedback(prev => ({ ...prev, [appId]: { type: "error", text: "Failed to assign teachers" } }));
      }
    } catch (err) {
      console.error("Teacher assign error:", err);
      setAssignmentFeedback(prev => ({ ...prev, [appId]: { type: "error", text: "An error occurred" } }));
    }
    setProcessing(false);
    setTimeout(() => setAssignmentFeedback(prev => { const next = { ...prev }; delete next[appId]; return next; }), 3000);
  };

  if (!user) {
    return null;
  }

  const filteredApps = filter === "ALL" ? applications : applications.filter((a) => a.status === filter);

  const parseHistory = (json: string) => {
    try { return JSON.parse(json); } catch { return []; }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      <div className="flex-1 relative z-10 max-w-6xl mx-auto w-full px-4 py-8">
        {user.role === "STUDENT" ? (
          <StudentDashboard />
        ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2 lining-nums">
            {user.role === "ADMIN" ? "Admin" : "Teacher"} Dashboard
          </h1>
          <p className="text-sm text-warm-gray mb-8">Review and manage student applications.</p>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
              {[
                { label: "Students", value: stats.totalStudents, icon: Users, color: "text-saffron" },
                { label: "Total Apps", value: stats.totalApplications, icon: FileText, color: "text-earth" },
                { label: "Pending", value: stats.pendingApplications, icon: Clock, color: "text-amber-600" },
                { label: "Approved", value: stats.approvedApplications, icon: CheckCircle, color: "text-green-600" },
                { label: "Rejected", value: stats.rejectedApplications, icon: XCircle, color: "text-red-500" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={stat.color} />
                      <span className="text-xs text-warm-gray">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground lining-nums">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]
              .filter(f => user.role === "ADMIN" || f !== "PENDING")
              .map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    filter === f
                      ? "bg-saffron text-cream"
                      : "bg-white/50 text-warm-gray border border-sand/50 hover:bg-saffron/10"
                  }`}
                >
                  {f === "ALL" ? "All" : f.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            <span className="text-xs text-warm-gray ml-2">
              {filteredApps.length} application{filteredApps.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-warm-gray">Loading applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-2xl border border-sand/50">
              <BarChart3 size={36} className="mx-auto text-sand mb-3" />
              <p className="text-sm text-warm-gray">No applications match the current filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => {
                const isExpanded = expandedApp === app.id;
                const history = parseHistory(app.courseHistory);
                return (
                  <div key={app.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 overflow-hidden transition-all duration-500">
                    {/* Header Row */}
                    <button
                      onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-saffron/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-saffron/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-saffron">
                            {app.firstName?.[0]}{app.lastName?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {app.firstName} {app.lastName}
                          </p>
                          <p className="text-xs text-warm-gray">
                            {app.courseType} &middot; {app.centerName || "No center"} &middot;{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            app.status === "APPROVED"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : app.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {app.status}
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-warm-gray" /> : <ChevronDown size={16} className="text-warm-gray" />}
                      </div>
                    </button>

                    {/* Expanded Details (6-page review) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-sand/50 p-5 space-y-5">
                            {/* Page 1 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 1 — Personal Info</h4>
                              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                                <p>
                                  <span className="text-warm-gray">DOB:</span> {app.dateOfBirth}
                                  {app.dateOfBirth && Math.floor((new Date().getTime() - new Date(app.dateOfBirth).getTime()) / 3.15576e+10) < 18 && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 font-bold text-[10px]">
                                      UNDER 18 ({Math.floor((new Date().getTime() - new Date(app.dateOfBirth).getTime()) / 3.15576e+10)} yrs)
                                    </span>
                                  )}
                                </p>
                                <p><span className="text-warm-gray">Gender:</span> {app.gender}</p>
                                <p><span className="text-warm-gray">Country:</span> {app.nationality}</p>
                                <p><span className="text-warm-gray">ID/Passport:</span> {app.email}</p>
                                <p><span className="text-warm-gray">Phone:</span> {app.phoneNumber}</p>
                                <p><span className="text-warm-gray">Languages:</span> {app.languagesSpoken}</p>
                                <p><span className="text-warm-gray">Emergency:</span> {app.emergencyContact} ({app.emergencyPhone})</p>
                                {app.pregnancyStatus && app.pregnancyStatus !== "N/A" && (
                                  <p><span className="text-warm-gray">Pregnancy:</span> {app.pregnancyStatus} {app.pregnancyMonths ? `(${app.pregnancyMonths} months)` : ""}</p>
                                )}
                              </div>
                            </div>

                            {/* Page 2 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 2 — Medical Info</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {[
                                  { label: "Diabetes", val: app.hasDiabetes },
                                  { label: "Heart", val: app.hasHeartCondition },
                                  { label: "Epilepsy", val: app.hasEpilepsy },
                                  { label: "Asthma", val: app.hasAsthma },
                                  { label: "Back", val: app.hasBackProblems },
                                  { label: "High BP", val: app.hasHighBloodPressure },
                                  { label: "Hepatitis", val: app.hasHepatitis },
                                  { label: "Tuberculosis", val: app.hasTuberculosis },
                                  { label: "Typhoid", val: app.hasTyphoid },
                                  { label: "Other Infectious", val: app.hasOtherInfectious },
                                  { label: "Depression", val: app.hasDepression },
                                  { label: "Anxiety", val: app.hasAnxiety },
                                  { label: "Schizophrenia", val: app.hasSchizophrenia },
                                ].map((c) => (
                                  <span
                                    key={c.label}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                      c.val ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"
                                    }`}
                                  >
                                    {c.label}: {c.val ? "Yes" : "No"}
                                  </span>
                                ))}
                              </div>
                              {app.usesDrugs && <p className="text-xs text-warm-gray mt-1"><span className="text-red-600 font-medium">Uses Drugs:</span> {app.drugDetails}</p>}
                              {app.otherConditions && <p className="text-xs text-warm-gray mt-1"><span className="font-medium">Other:</span> {app.otherConditions}</p>}
                              {app.currentMedications && <p className="text-xs text-warm-gray mt-1"><span className="font-medium">Medications:</span> {app.currentMedications}</p>}
                              {app.dietaryRequirements && <p className="text-xs text-warm-gray mt-1"><span className="font-medium">Dietary Requirements:</span> {app.dietaryRequirements}</p>}
                            </div>

                            {/* Page 3 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 3 — Family Info</h4>
                              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                                <p><span className="text-warm-gray">Marital Status:</span> {app.maritalStatus}</p>
                                {app.maritalStatus === "Married" && <p><span className="text-warm-gray">Spouse:</span> {app.spouseName}</p>}
                                <p><span className="text-warm-gray">Dependents:</span> {app.dependentsCount}</p>
                                <p><span className="text-warm-gray">Next of Kin:</span> {app.nextOfKinName} ({app.nextOfKinRelationship})</p>
                                <p><span className="text-warm-gray">Kin Contact:</span> {app.nextOfKinContact}</p>
                                <p><span className="text-warm-gray">Family Aware:</span> {app.familyAware ? "Yes" : "No"}</p>
                              </div>
                              {app.familyHealthHistory && <p className="text-xs text-warm-gray mt-1"><span className="font-medium">Family Health History:</span> {app.familyHealthHistory}</p>}
                            </div>

                            {/* Page 4 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 4 — Occupational Info</h4>
                              <div className="grid sm:grid-cols-3 gap-2 text-xs mb-2">
                                <p><span className="text-warm-gray">Occupation:</span> {app.occupation}</p>
                                <p><span className="text-warm-gray">Employer:</span> {app.employer}</p>
                                <p><span className="text-warm-gray">Employer Contact:</span> {app.employerContact}</p>
                              </div>
                              {app.reasonForAttending && <p className="text-xs text-warm-gray mt-1"><span className="font-medium">Reason:</span> {app.reasonForAttending}</p>}
                              {app.specialRequests && <p className="text-xs text-warm-gray mt-1"><span className="font-medium">Special Requests:</span> {app.specialRequests}</p>}
                              <p className="text-xs mt-2">
                                <span className="text-warm-gray">Discipline Declaration:</span>{" "}
                                <span className={app.disciplineDeclaration ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                  {app.disciplineDeclaration ? "Accepted" : "Not Accepted"}
                                </span>
                                {" | "}
                                <span className="text-warm-gray">Final Instructions:</span>{" "}
                                <span className={app.finalInstructions ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                  {app.finalInstructions ? "Accepted" : "Not Accepted"}
                                </span>
                              </p>
                            </div>

                            {/* Page 5 - Course History */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 5 — Course History</h4>
                              {history && history.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                                  <p><span className="text-warm-gray">10-Day Courses:</span> {history[0].manual10DayCount}</p>
                                  <p><span className="text-warm-gray">20-Day Courses:</span> {history[0].manual20DayCount}</p>
                                  <p><span className="text-warm-gray">30-Day Courses:</span> {history[0].manual30DayCount}</p>
                                  <p><span className="text-warm-gray">Last Course End Date:</span> {history[0].lastCourseEndDate || "N/A"}</p>
                                  <p><span className="text-warm-gray">Previous Teacher:</span> {teachers.find(t => t.id === history[0].previousTeacherId)?.name || history[0].previousTeacherId || "N/A"}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-warm-gray">No manual course history provided.</p>
                              )}
                            </div>

                            {/* Page 6 - Internal (Teacher/Admin only) */}
                            <div className="bg-cream-dark/50 rounded-xl p-4 border border-saffron/10">
                              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                                Page 6 — Internal Notes (Hidden from Student)
                              </h4>
                              <div className="mb-4">
                                {user.role === "ADMIN" ? (
                                  <div className="space-y-3">
                                    <h5 className="text-xs font-semibold text-foreground">Assign Teachers</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div>
                                        <label className="block text-[10px] text-warm-gray mb-1">Previous Teacher (Optional)</label>
                                        <select
                                          value={assignments[app.id]?.prev ?? app.previousTeacherId ?? ""}
                                          onChange={(e) => setAssignments(prev => ({ ...prev, [app.id]: { ...prev[app.id], prev: e.target.value } }))}
                                          className="w-full px-2 py-1 text-xs rounded border border-sand bg-white"
                                        >
                                          <option value="">None</option>
                                          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-warm-gray mb-1">New Teacher (Required)</label>
                                        <select
                                          value={assignments[app.id]?.new ?? app.newTeacherId ?? ""}
                                          onChange={(e) => setAssignments(prev => ({ ...prev, [app.id]: { ...prev[app.id], new: e.target.value } }))}
                                          className="w-full px-2 py-1 text-xs rounded border border-sand bg-white"
                                        >
                                          <option value="">Select New Teacher</option>
                                          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-warm-gray mb-1">Area Teacher (Required)</label>
                                        <select
                                          value={assignments[app.id]?.area ?? app.areaTeacherId ?? ""}
                                          onChange={(e) => setAssignments(prev => ({ ...prev, [app.id]: { ...prev[app.id], area: e.target.value } }))}
                                          className="w-full px-2 py-1 text-xs rounded border border-sand bg-white"
                                        >
                                          <option value="">Select Area Teacher</option>
                                          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                      <button
                                        onClick={() => handleAssignTeachers(app.id)}
                                        disabled={processing}
                                        className="px-3 py-1.5 bg-saffron text-cream text-xs font-medium rounded hover:bg-saffron-dark transition-colors disabled:opacity-50"
                                      >
                                        Save Assignments
                                      </button>
                                      <AnimatePresence>
                                        {assignmentFeedback[app.id] && (
                                          <motion.span
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`text-xs font-medium ${assignmentFeedback[app.id].type === "success" ? "text-green-600" : "text-red-600"}`}
                                          >
                                            {assignmentFeedback[app.id].text}
                                          </motion.span>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1 text-xs">
                                    <p><span className="text-warm-gray font-medium">Previous Teacher:</span> {teachers.find(t => t.id === app.previousTeacherId)?.name || "None"}</p>
                                    <p><span className="text-warm-gray font-medium">New Teacher:</span> {teachers.find(t => t.id === app.newTeacherId)?.name || "Unassigned"}</p>
                                    <p><span className="text-warm-gray font-medium">Area Teacher:</span> {teachers.find(t => t.id === app.areaTeacherId)?.name || "Unassigned"}</p>
                                    <p className="mt-2"><span className="text-warm-gray font-medium">Current Stage:</span> <span className="font-semibold text-saffron">{app.currentReviewStage?.replace("PENDING_", "") || "Waiting for Assignment"}</span></p>
                                  </div>
                                )}
                              </div>
                              {app.assistantTeacherRemarks && (
                                <p className="text-xs mb-2">
                                  <span className="text-warm-gray font-medium">Previous Teacher Remarks:</span>{" "}
                                  {app.assistantTeacherRemarks}
                                </p>
                              )}
                              {app.regionalCoordinatorRemarks && (
                                <p className="text-xs mb-2">
                                  <span className="text-warm-gray font-medium">Previous Coordinator Remarks:</span>{" "}
                                  {app.regionalCoordinatorRemarks}
                                </p>
                              )}
                              {app.status === "REJECTED" && (
                                (() => {
                                  // @ts-ignore
                                  const rejection = app.reviews?.find((r: any) => r.decision === "REJECTED");
                                  if (!rejection) return null;
                                  const rejectingTeacher = teachers.find(t => t.id === rejection.reviewerId)?.name || "A Teacher";
                                  return (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                                      <p className="text-xs text-red-800 font-medium">Rejected by: {rejectingTeacher}</p>
                                      <p className="text-xs text-red-600 mt-1">Reason: {rejection.remarks}</p>
                                    </div>
                                  );
                                })()
                              )}

                            </div>

                            {/* Action Buttons */}
                            {user.role !== "ADMIN" && (app.status === "PENDING" || app.status === "UNDER_REVIEW") && app.currentReviewStage && (
                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  onClick={() => handleApprove(app.id)}
                                  disabled={processing}
                                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 disabled:opacity-50"
                                >
                                  <Check size={16} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectionModal(app.id)}
                                  disabled={processing}
                                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
                                >
                                  <X size={16} />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
        )}
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setRejectionModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream rounded-2xl border border-sand/50 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-serif text-lg font-bold text-red-600 mb-4">Reject Application</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Rejection Reason</label>
                  <p className="text-xs text-warm-gray mb-2">This reason will be sent to the applicant via SMS.</p>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    rows={4}
                    placeholder="Please explain why the application is being rejected..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => handleReject(rejectionModal)}
                  disabled={processing || !remarks.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
                >
                  <X size={16} />
                  {processing ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>

              <button
                onClick={() => setRejectionModal(null)}
                className="w-full mt-3 py-2 text-sm text-warm-gray hover:text-foreground transition-colors text-center"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
