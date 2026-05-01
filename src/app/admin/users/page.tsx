"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, BookOpen, User as UserIcon, Plus, Upload, X, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";

interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  currentStage: number;
  createdAt: string;
  _count: { applications: number };
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  TEACHER: "bg-blue-50 text-blue-700 border-blue-200",
  STUDENT: "bg-saffron/10 text-saffron-dark border-saffron/20",
};

export default function AdminUsersPage() {
  const { user, checkAuth } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Users fetch error:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchUsers();
  }, [user, fetchUsers]);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeacherName, email: newTeacherEmail, password: newTeacherPassword }),
      });
      if (res.ok) {
        setShowTeacherModal(false);
        setNewTeacherName("");
        setNewTeacherEmail("");
        setNewTeacherPassword("");
        fetchUsers();
      } else {
        alert("Failed to create teacher.");
      }
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  const handleStageChange = async (userId: string, stage: number) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, stage }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, currentStage: stage } : u)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  const filtered = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      <div className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">User Management</h1>
              <p className="text-sm text-warm-gray">Manage all registered users and view student progress.</p>
            </div>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 shadow-lg shadow-saffron/20"
            >
              <Plus size={16} />
              Add Teacher
            </button>
          </div>

          {/* Role summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Admins", count: users.filter((u) => u.role === "ADMIN").length, icon: Shield, color: "text-purple-600" },
              { label: "Teachers", count: users.filter((u) => u.role === "TEACHER").length, icon: BookOpen, color: "text-blue-600" },
              { label: "Students", count: users.filter((u) => u.role === "STUDENT").length, icon: UserIcon, color: "text-saffron" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className={item.color} />
                    <span className="text-xs text-warm-gray">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{item.count}</p>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {["ALL", "ADMIN", "TEACHER", "STUDENT"].map((f) => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  roleFilter === f
                    ? "bg-saffron text-cream"
                    : "bg-white/50 text-warm-gray border border-sand/50 hover:bg-saffron/10"
                }`}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase() + "s"}
              </button>
            ))}
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin mx-auto mb-3" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-4 hover:border-saffron/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-saffron">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{u.name}</p>
                      <p className="text-xs text-warm-gray">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${roleColors[u.role] || ""}`}>
                      {u.role}
                    </span>
                    <span className="text-xs text-warm-gray px-2 border-l border-sand">
                      {u._count.applications} app{u._count.applications !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-warm-gray px-2 border-l border-sand hidden sm:inline-block">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </span>

                    {u.role === "STUDENT" && (
                      <div className="flex items-center gap-2 pl-2 border-l border-sand">
                        <span className="text-[10px] uppercase text-warm-gray font-medium">Stage:</span>
                        <select
                          value={u.currentStage || 0}
                          onChange={(e) => handleStageChange(u.id, parseInt(e.target.value, 10))}
                          className="bg-white border border-sand rounded px-2 py-1 text-xs text-saffron-dark focus:outline-none focus:border-saffron"
                        >
                          <option value={0}>Base</option>
                          <option value={1}>Stage 1</option>
                          <option value={2}>Stage 2</option>
                          <option value={3}>Stage 3</option>
                          <option value={4}>Stage 4</option>
                          <option value={5}>Stage 5</option>
                          <option value={6}>Stage 6</option>
                          <option value={7}>Stage 7</option>
                          <option value={8}>Stage 8</option>
                          <option value={9}>Stage 9</option>
                          <option value={10}>Stage 10</option>
                        </select>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {showTeacherModal && (
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
              className="bg-cream rounded-2xl border border-sand/50 shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold text-foreground">Add New Teacher</h3>
                <button onClick={() => setShowTeacherModal(false)} className="text-warm-gray hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTeacher} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newTeacherPassword}
                    onChange={(e) => setNewTeacherPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 disabled:opacity-50"
                >
                  <Save size={16} />
                  {creating ? "Creating..." : "Save Teacher"}
                </button>
              </form>

              <div className="mt-8 border-t border-sand/50 pt-6">
                <h4 className="text-sm font-medium text-foreground mb-2">Bulk Import (Coming Soon)</h4>
                <div className="border-2 border-dashed border-sand rounded-xl p-6 text-center bg-white/30">
                  <Upload size={24} className="mx-auto text-warm-gray mb-2" />
                  <p className="text-xs text-warm-gray">Upload an Excel sheet to create multiple teachers at once.</p>
                  <button disabled className="mt-3 px-4 py-1.5 rounded-lg border border-sand bg-white text-xs text-warm-gray opacity-50 cursor-not-allowed">
                    Select .xlsx File
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
