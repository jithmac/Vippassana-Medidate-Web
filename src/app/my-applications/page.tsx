"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";

interface Application {
  id: string;
  courseType: string;
  centerName: string;
  status: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Pending Review" },
  UNDER_REVIEW: { icon: Eye, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Under Review" },
  APPROVED: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Approved" },
  REJECTED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Rejected" },
};

export default function MyApplicationsPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      <div className="flex-1 relative z-10 max-w-4xl mx-auto w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-2xl font-bold text-moss mb-2">My Applications</h1>
          <p className="text-sm text-warm-gray mb-8">Track the status of your course applications.</p>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-sage/30 border-t-sage rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-warm-gray">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-2xl border border-sand/50">
              <FileText size={40} className="mx-auto text-sand mb-4" />
              <h3 className="font-serif text-lg font-semibold text-moss mb-2">No Applications Yet</h3>
              <p className="text-sm text-warm-gray mb-6">You haven&apos;t submitted any course applications.</p>
              <button
                onClick={() => router.push("/apply")}
                className="px-6 py-2.5 rounded-xl bg-sage text-cream text-sm font-medium hover:bg-sage-dark transition-all duration-300"
              >
                Apply for a Course
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, i) => {
                const status = statusConfig[app.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-5 hover:border-sage/30 hover:shadow-md transition-all duration-500"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif text-base font-semibold text-moss">
                            {app.courseType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Course
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-warm-gray">
                          <span>Center: {app.centerName || "Not specified"}</span>
                          <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
