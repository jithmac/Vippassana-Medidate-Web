import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface Application {
  id: string;
  courseType: string;
  course: { startDate: string, centerName: string } | null;
  status: string;
  createdAt: string;
}

interface Enrollment {
  courseType: string;
  completedAt: string | null;
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch("/api/applications").then(res => res.json()),
        fetch("/api/student/eligibility").then(res => res.json()) // Maybe fetch enrollments separately, or rely on applications
      ]).then(([appsData]) => {
        if (appsData.applications) {
          setApplications(appsData.applications);
        }
        setLoading(false);
      });
      
      fetch("/api/student/enrollments")
        .then(res => res.json())
        .then(data => {
            if (data.enrollments) setEnrollments(data.enrollments);
        }).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-warm-gray">Loading dashboard...</p>
      </div>
    );
  }

  const pendingCount = applications.filter(a => a.status === "PENDING" || a.status === "UNDER_REVIEW").length;
  const completedCount = enrollments.filter(e => e.completedAt !== null).length;

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-saffron/10 border border-saffron/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">Welcome back, {user?.name}!</h2>
          <p className="text-sm text-warm-gray mt-1">Continue your path of practice.</p>
        </div>
        <button
          onClick={() => router.push("/apply")}
          className="px-6 py-2.5 rounded-xl bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 whitespace-nowrap"
        >
          Apply for a Course
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-5">
          <div className="flex items-center gap-2 mb-2 text-saffron">
            <CheckCircle size={18} />
            <span className="font-medium">Completed Courses</span>
          </div>
          <p className="text-3xl font-bold text-foreground lining-nums">{completedCount}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-600">
            <Clock size={18} />
            <span className="font-medium">Active Applications</span>
          </div>
          <p className="text-3xl font-bold text-foreground lining-nums">{pendingCount}</p>
        </div>
      </div>

      {/* Applications */}
      <div>
        <h3 className="font-serif text-lg font-bold text-foreground mb-4">Your Applications</h3>
        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-sand/50">
            <FileText size={32} className="mx-auto text-sand mb-3" />
            <p className="text-sm text-warm-gray">You haven&apos;t submitted any course applications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-5 hover:border-saffron/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{app.courseType.replace("_", " ")}</h4>
                    <p className="text-xs text-warm-gray mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                    {app.status === "APPROVED" && app.course && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Application Approved!</p>
                          <p className="text-xs text-green-700 mt-1">
                            Your course starts on <span className="font-bold">{app.course.startDate}</span> at {app.course.centerName}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      app.status === "APPROVED" ? "bg-green-50 text-green-700 border border-green-200" :
                      app.status === "REJECTED" ? "bg-red-50 text-red-700 border border-red-200" :
                      app.status === "DRAFT" ? "bg-gray-100 text-gray-700 border border-gray-300" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
