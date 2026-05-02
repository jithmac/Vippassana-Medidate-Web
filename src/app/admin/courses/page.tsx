"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, X, Save, Calendar, Users, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";

interface Course {
  id: string;
  courseType: string;
  centerName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  stage: number;
  status: string;
}

export default function AdminCoursesPage() {
  const { user, checkAuth } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [courseType, setCourseType] = useState("10-day");
  const [centerName, setCenterName] = useState("Dhamma Maneeratta");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("100");
  const [stage, setStage] = useState("1");
  const [teacherId, setTeacherId] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Courses fetch error:", err);
    }
    setLoading(false);
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        const teacherUsers = data.users.filter((u: any) => u.role === "TEACHER");
        setTeachers(teacherUsers);
      }
    } catch (err) {
      console.error("Teachers fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchCourses();
      fetchTeachers();
    }
  }, [user, fetchCourses, fetchTeachers]);

  // Auto-calculate end date based on course type and start date
  useEffect(() => {
    if (!startDate) return;

    const start = new Date(startDate);
    if (isNaN(start.getTime())) return;

    let daysToAdd = 0;
    switch (courseType) {
      case "10-day": daysToAdd = 11; break;
      case "20-day": daysToAdd = 21; break;
      case "30-day": daysToAdd = 31; break;
      case "45-day": daysToAdd = 46; break;
      case "60-day": daysToAdd = 61; break;
      case "satipatthana": daysToAdd = 9; break;
    }

    if (daysToAdd > 0) {
      const end = new Date(start);
      end.setDate(end.getDate() + daysToAdd);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [startDate, courseType]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseType,
          centerName,
          startDate,
          endDate,
          capacity: parseInt(capacity),
          stage: parseInt(stage),
          teacherId,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setStartDate("");
        setEndDate("");
        fetchCourses();
      } else {
        alert("Failed to create course.");
      }
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      <div className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Course Management</h1>
              <p className="text-sm text-warm-gray">Schedule new courses and manage existing ones.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 shadow-lg shadow-saffron/20"
            >
              <Plus size={16} />
              Schedule Course
            </button>
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin mx-auto mb-3" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-5 hover:border-saffron/30 transition-all duration-300 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">{c.courseType}</h3>
                      <div className="flex items-center gap-2 text-xs text-warm-gray mt-1">
                        <MapPin size={12} />
                        {c.centerName}
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${c.status === "OPEN" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-warm-gray">
                      <Calendar size={14} className="text-saffron" />
                      <span>{c.startDate} - {c.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-warm-gray">
                      <BookOpen size={14} className="text-saffron" />
                      <span>Stage {c.stage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-warm-gray col-span-2">
                      <Users size={14} className="text-saffron" />
                      <span>{c.enrolled} / {c.capacity} Enrolled</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-sand/30 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-saffron h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (c.enrolled / c.capacity) * 100)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
              
              {courses.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white/50 rounded-2xl border border-sand/50">
                  <p className="text-sm text-warm-gray">No courses scheduled yet.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream rounded-2xl border border-sand/50 shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold text-foreground">Schedule Course</h3>
                <button onClick={() => setShowModal(false)} className="text-warm-gray hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Course Type</label>
                  <select
                    value={courseType}
                    onChange={(e) => setCourseType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  >
                    <option value="10-day">10-Day Course</option>
                    <option value="20-day">20-Day Course</option>
                    <option value="30-day">30-Day Course</option>
                    <option value="45-day">45-Day Course</option>
                    <option value="60-day">60-Day Course</option>
                    <option value="satipatthana">Satipatthana Course</option>
                    <option value="service">Dhamma Service</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Center</label>
                  <select
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  >
                    <option value="Dhamma Maneeratta">Dhamma Maneeratta</option>
                    <option value="Dhamma Mowbray">Dhamma Mowbray</option>
                    <option value="Dhamma Kuta">Dhamma Kuta</option>
                    <option value="Dhamma Sobha">Dhamma Sobha</option>
                    <option value="Dhamma Aloka">Dhamma Aloka</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Capacity</label>
                    <input
                      type="number"
                      required
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    >
                      <option value="1">Stage 1</option>
                      <option value="2">Stage 2</option>
                      <option value="3">Stage 3</option>
                      <option value="4">Stage 4</option>
                      <option value="5">Stage 5</option>
                      <option value="6">Stage 6</option>
                      <option value="7">Stage 7</option>
                      <option value="8">Stage 8</option>
                      <option value="9">Stage 9</option>
                      <option value="10">Stage 10</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Assigned Teacher (Optional)</label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  >
                    <option value="">-- Select a Teacher --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 disabled:opacity-50"
                >
                  <Save size={16} />
                  {creating ? "Scheduling..." : "Schedule Course"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
