"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";
import { Users, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherEnrollmentsPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [completionReview, setCompletionReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      if (!["PREVIOUS_TEACHER", "AREA_TEACHER", "ADMIN"].includes(user.role)) {
        router.push("/dashboard");
      } else {
        fetchEnrollments();
      }
    }
  }, [user, router]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments/teacher");
      const data = await res.json();
      if (data.enrollments) setEnrollments(data.enrollments);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!selectedEnrollment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/enrollments/${selectedEnrollment.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionReview
        })
      });
      if (res.ok) {
        setSelectedEnrollment(null);
        setCompletionReview("");
        fetchEnrollments();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to complete enrollment");
      }
    } catch (e) {
      alert("Network error");
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />
      
      <div className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Active Enrollments</h1>
          <p className="text-warm-gray text-sm">Mark students as completed after they finish their course to update their eligibility.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <div className="animate-pulse bg-white/50 h-32 rounded-2xl"></div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-sand">
                <Users className="mx-auto text-warm-gray/50 mb-3" size={32} />
                <p className="text-warm-gray text-sm">No active enrollments found.</p>
              </div>
            ) : (
              enrollments.map(enrollment => (
                <button
                  key={enrollment.id}
                  onClick={() => {
                    setSelectedEnrollment(enrollment);
                    setCompletionReview("");
                  }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    selectedEnrollment?.id === enrollment.id 
                      ? "bg-saffron/10 border-saffron shadow-sm" 
                      : "bg-white/70 border-sand hover:border-saffron/50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{enrollment.user.name}</h3>
                    <span className="text-[10px] uppercase bg-sand/30 px-2 py-0.5 rounded text-warm-gray">{enrollment.courseType}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <Clock size={14} /> In Progress
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedEnrollment ? (
                <motion.div
                  key={selectedEnrollment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/80 backdrop-blur-sm border border-saffron/20 rounded-2xl p-6 shadow-xl shadow-saffron/5"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                        {selectedEnrollment.user.name}
                      </h2>
                      <p className="text-sm text-warm-gray">ID: {selectedEnrollment.user.idPassportNumber} • {selectedEnrollment.user.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-sand pt-6">
                    <h3 className="font-medium text-foreground">Complete Enrollment</h3>
                    <p className="text-sm text-warm-gray">Marking this enrollment as completed will unlock higher-level courses for the student.</p>
                    
                    <textarea
                      value={completionReview}
                      onChange={(e) => setCompletionReview(e.target.value)}
                      placeholder="Add completion remarks or teacher notes (optional)..."
                      className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm focus:outline-none focus:border-saffron resize-none h-24"
                    />
                    
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={handleComplete}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={16} /> Mark Course as Completed
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center min-h-[400px] bg-white/40 border border-dashed border-sand/50 rounded-2xl">
                  <p className="text-warm-gray">Select an enrollment to mark as completed.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
