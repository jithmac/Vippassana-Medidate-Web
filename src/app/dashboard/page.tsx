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
  emergencyContact: string;
  emergencyPhone: string;
  pregnancyStatus: string;
  sinhalaProficiency: string;
  hasDiabetes: boolean;
  hasHeartCondition: boolean;
  hasDepression: boolean;
  hasAnxiety: boolean;
  hasEpilepsy: boolean;
  hasAsthma: boolean;
  hasBackProblems: boolean;
  otherConditions: string;
  currentMedications: string;
  dietaryRequirements: string;
  disciplineDeclaration: boolean;
  dailyPractice: boolean;
  practiceHoursPerDay: string;
  followsFivePrecepts: boolean;
  practiceDetails: string;
  courseHistory: string;
  occupation: string;
  specialRequests: string;
  assistantTeacherRemarks: string;
  regionalCoordinatorRemarks: string;
  createdAt: string;
  user: AppUser;
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
  const [approvalModal, setApprovalModal] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [approvalDate, setApprovalDate] = useState("");
  const [approvalItems, setApprovalItems] = useState("White clothing, personal toiletries, meditation cushion");
  const [processing, setProcessing] = useState(false);

  // Page 6 internal fields
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [coordinatorRemarks, setCoordinatorRemarks] = useState("");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/admin/stats"),
      ]);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
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
    const app = applications.find((a) => a.id === appId);
    try {
      // Save Page 6 internal remarks
      if (teacherRemarks || coordinatorRemarks) {
        await fetch(`/api/applications/${appId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assistantTeacherRemarks: teacherRemarks,
            regionalCoordinatorRemarks: coordinatorRemarks,
          }),
        });
      }

      const res = await fetch(`/api/applications/${appId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remarks,
          centerName: app?.centerName,
          date: approvalDate,
          items: approvalItems,
        }),
      });
      if (res.ok) {
        await fetchData();
        setApprovalModal(null);
        setRemarks("");
        setTeacherRemarks("");
        setCoordinatorRemarks("");
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
    setProcessing(false);
  };

  const handleReject = async (appId: string) => {
    setProcessing(true);
    try {
      if (teacherRemarks || coordinatorRemarks) {
        await fetch(`/api/applications/${appId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assistantTeacherRemarks: teacherRemarks,
            regionalCoordinatorRemarks: coordinatorRemarks,
          }),
        });
      }

      const res = await fetch(`/api/applications/${appId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      });
      if (res.ok) {
        await fetchData();
        setApprovalModal(null);
        setRemarks("");
        setTeacherRemarks("");
        setCoordinatorRemarks("");
      }
    } catch (err) {
      console.error("Rejection error:", err);
    }
    setProcessing(false);
  };

  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
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

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].map((f) => (
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
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 1 — Identity</h4>
                              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                                <p><span className="text-warm-gray">DOB:</span> {app.dateOfBirth}</p>
                                <p><span className="text-warm-gray">Gender:</span> {app.gender}</p>
                                <p><span className="text-warm-gray">Nationality:</span> {app.nationality}</p>
                                <p><span className="text-warm-gray">Phone:</span> {app.phoneNumber}</p>
                                <p><span className="text-warm-gray">Emergency:</span> {app.emergencyContact} ({app.emergencyPhone})</p>
                                <p><span className="text-warm-gray">Sinhala:</span> {app.sinhalaProficiency}</p>
                                {app.pregnancyStatus !== "N/A" && (
                                  <p><span className="text-warm-gray">Pregnancy:</span> {app.pregnancyStatus}</p>
                                )}
                              </div>
                            </div>

                            {/* Page 2 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 2 — Health & Conduct</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {[
                                  { label: "Diabetes", val: app.hasDiabetes },
                                  { label: "Heart", val: app.hasHeartCondition },
                                  { label: "Depression", val: app.hasDepression },
                                  { label: "Anxiety", val: app.hasAnxiety },
                                  { label: "Epilepsy", val: app.hasEpilepsy },
                                  { label: "Asthma", val: app.hasAsthma },
                                  { label: "Back", val: app.hasBackProblems },
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
                              {app.otherConditions && <p className="text-xs text-warm-gray">Other: {app.otherConditions}</p>}
                              {app.currentMedications && <p className="text-xs text-warm-gray">Medications: {app.currentMedications}</p>}
                              <p className="text-xs mt-1">
                                <span className="text-warm-gray">Discipline Declaration:</span>{" "}
                                <span className={app.disciplineDeclaration ? "text-green-600" : "text-red-600"}>
                                  {app.disciplineDeclaration ? "Accepted" : "Not Accepted"}
                                </span>
                              </p>
                            </div>

                            {/* Page 3 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 3 — Practice History</h4>
                              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                                <p><span className="text-warm-gray">Daily Practice:</span> {app.dailyPractice ? "Yes" : "No"}</p>
                                <p><span className="text-warm-gray">Hours/Day:</span> {app.practiceHoursPerDay}</p>
                                <p><span className="text-warm-gray">Five Precepts:</span> {app.followsFivePrecepts ? "Yes" : "No"}</p>
                              </div>
                              {app.practiceDetails && <p className="text-xs text-warm-gray mt-1">{app.practiceDetails}</p>}
                            </div>

                            {/* Page 4 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 4 — Course History ({history.length} courses)</h4>
                              {history.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-sand/50">
                                        <th className="text-left py-1 text-warm-gray font-medium">Type</th>
                                        <th className="text-left py-1 text-warm-gray font-medium">Center</th>
                                        <th className="text-left py-1 text-warm-gray font-medium">Dates</th>
                                        <th className="text-left py-1 text-warm-gray font-medium">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {history.map((h: { courseType: string; centerName: string; startDate: string; endDate: string; completed: boolean }, idx: number) => (
                                        <tr key={idx} className="border-b border-sand/20">
                                          <td className="py-1.5 text-foreground">{h.courseType}</td>
                                          <td className="py-1.5 text-foreground">{h.centerName}</td>
                                          <td className="py-1.5 text-foreground">{h.startDate} → {h.endDate}</td>
                                          <td className="py-1.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${h.completed ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                              {h.completed ? "Completed" : "Incomplete"}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-xs text-warm-gray italic">No course history recorded.</p>
                              )}
                            </div>

                            {/* Page 5 Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Page 5 — Summary</h4>
                              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                                <p><span className="text-warm-gray">Occupation:</span> {app.occupation || "N/A"}</p>
                                <p><span className="text-warm-gray">Special Requests:</span> {app.specialRequests || "None"}</p>
                              </div>
                            </div>

                            {/* Page 6 - Internal (Teacher/Admin only) */}
                            <div className="bg-cream-dark/50 rounded-xl p-4 border border-saffron/10">
                              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                                Page 6 — Internal Notes (Hidden from Student)
                              </h4>
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
                            </div>

                            {/* Action Buttons */}
                            {app.status === "PENDING" && (
                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  onClick={() => setApprovalModal(app.id)}
                                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300"
                                >
                                  <Check size={16} />
                                  Review & Decide
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
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {approvalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setApprovalModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream rounded-2xl border border-sand/50 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">Review Application</h3>

              {/* Page 6 Internal Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Assistant Teacher Remarks</label>
                  <textarea
                    value={teacherRemarks}
                    onChange={(e) => setTeacherRemarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-foreground text-sm resize-none"
                    rows={2}
                    placeholder="Internal remarks..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Regional Coordinator Remarks</label>
                  <textarea
                    value={coordinatorRemarks}
                    onChange={(e) => setCoordinatorRemarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-foreground text-sm resize-none"
                    rows={2}
                    placeholder="Coordinator notes..."
                  />
                </div>
              </div>

              <hr className="border-sand/50 mb-4" />

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Public Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-foreground text-sm resize-none"
                    rows={2}
                    placeholder="Remarks to the student..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Course Start Date (for approval SMS)</label>
                  <input
                    type="date"
                    value={approvalDate}
                    onChange={(e) => setApprovalDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-foreground text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Items to Bring</label>
                  <input
                    type="text"
                    value={approvalItems}
                    onChange={(e) => setApprovalItems(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => handleApprove(approvalModal)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 disabled:opacity-50"
                >
                  <Send size={16} />
                  {processing ? "Processing..." : "Approve & Send SMS"}
                </button>
                <button
                  onClick={() => handleReject(approvalModal)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
                >
                  <X size={16} />
                  Reject
                </button>
              </div>

              <button
                onClick={() => setApprovalModal(null)}
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
