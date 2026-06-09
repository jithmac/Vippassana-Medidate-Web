"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";
import { FileText, CheckCircle, XCircle, AlertCircle, Eye, Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherReviewPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      if (user.role !== "NEW_TEACHER" && user.role !== "PREVIOUS_TEACHER") {
        router.push("/dashboard");
      } else {
        fetchReviews();
      }
    }
  }, [user, router]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews/pending");
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAction = async (action: string) => {
    if (!selectedReview) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          action,
          remarks
        })
      });
      if (res.ok) {
        setSelectedReview(null);
        setRemarks("");
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit action");
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
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Review Applications</h1>
          <p className="text-warm-gray text-sm">Review student applications assigned to the {user.role.replace("_", " ")} queue.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <div className="animate-pulse bg-white/50 h-32 rounded-2xl"></div>
            ) : reviews.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-sand">
                <FileText className="mx-auto text-warm-gray/50 mb-3" size={32} />
                <p className="text-warm-gray text-sm">No pending applications in the queue.</p>
              </div>
            ) : (
              reviews.map(review => (
                <button
                  key={review.id}
                  onClick={() => {
                    setSelectedReview(review);
                    setRemarks("");
                  }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    selectedReview?.id === review.id 
                      ? "bg-saffron/10 border-saffron shadow-sm" 
                      : "bg-white/70 border-sand hover:border-saffron/50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{review.application.user.name}</h3>
                    <span className="text-[10px] uppercase bg-sand/30 px-2 py-0.5 rounded text-warm-gray">{review.application.courseType}</span>
                  </div>
                  <p className="text-xs text-warm-gray mb-3">Submitted: {new Date(review.application.createdAt).toLocaleDateString()}</p>
                  
                  {review.reviewerId ? (
                    <div className="flex items-center gap-1.5 text-xs text-saffron-dark font-medium">
                      <Eye size={14} /> You claimed this
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                      <Hand size={14} /> Available to claim
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedReview ? (
                <motion.div
                  key={selectedReview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/80 backdrop-blur-sm border border-saffron/20 rounded-2xl p-6 shadow-xl shadow-saffron/5"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                        {selectedReview.application.user.name}
                      </h2>
                      <p className="text-sm text-warm-gray">ID: {selectedReview.application.user.idPassportNumber} • {selectedReview.application.user.country}</p>
                    </div>
                    {selectedReview.reviewerId !== user.id && (
                      <button
                        onClick={() => handleAction("CLAIM")}
                        disabled={submitting}
                        className="px-4 py-2 bg-saffron text-cream text-sm font-medium rounded-xl hover:bg-saffron-dark transition-colors disabled:opacity-50"
                      >
                        Claim to Review
                      </button>
                    )}
                  </div>

                  <div className="bg-sand/10 rounded-xl p-5 mb-6">
                    <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-saffron" />
                      Application Details
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div>
                        <p className="text-xs text-warm-gray mb-0.5">Course</p>
                        <p className="font-medium">{selectedReview.application.courseType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-warm-gray mb-0.5">Phone</p>
                        <p className="font-medium">{selectedReview.application.user.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-sand/50">
                      <button 
                        onClick={() => window.open(`/api/applications/${selectedReview.applicationId}/pdf`, '_blank')}
                        className="text-sm text-saffron hover:underline flex items-center gap-1.5 font-medium"
                      >
                        <FileText size={14} /> View Application Form PDF
                      </button>
                    </div>
                  </div>

                  {selectedReview.reviewerId === user.id && (
                    <div className="space-y-4 border-t border-sand pt-6">
                      <h3 className="font-medium text-foreground">Make a Decision</h3>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks (required for rejection/needs info, optional for approval)..."
                        className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm focus:outline-none focus:border-saffron resize-none h-24"
                      />
                      
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => handleAction("APPROVE")}
                          disabled={submitting}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={16} /> Approve & Escalate to Area Teacher
                        </button>
                        <button
                          onClick={() => handleAction("NEEDS_INFO")}
                          disabled={submitting || !remarks.trim()}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <AlertCircle size={16} /> Needs Info
                        </button>
                        <button
                          onClick={() => handleAction("REJECT")}
                          disabled={submitting || !remarks.trim()}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={16} /> Reject Application
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center min-h-[400px] bg-white/40 border border-dashed border-sand/50 rounded-2xl">
                  <p className="text-warm-gray">Select an application from the queue to review.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
