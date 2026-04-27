"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Shield, BookOpen, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";

interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  _count: { applications: number };
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  TEACHER: "bg-blue-50 text-blue-700 border-blue-200",
  STUDENT: "bg-sage/10 text-sage-dark border-sage/20",
};

export default function AdminUsersPage() {
  const { user, checkAuth } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");

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

  if (!user || user.role !== "ADMIN") return null;

  const filtered = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      <div className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-serif text-2xl font-bold text-moss mb-2">User Management</h1>
          <p className="text-sm text-warm-gray mb-8">Manage all registered users and view student progress.</p>

          {/* Role summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Admins", count: users.filter((u) => u.role === "ADMIN").length, icon: Shield, color: "text-purple-600" },
              { label: "Teachers", count: users.filter((u) => u.role === "TEACHER").length, icon: BookOpen, color: "text-blue-600" },
              { label: "Students", count: users.filter((u) => u.role === "STUDENT").length, icon: UserIcon, color: "text-sage" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className={item.color} />
                    <span className="text-xs text-warm-gray">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold text-moss">{item.count}</p>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            {["ALL", "ADMIN", "TEACHER", "STUDENT"].map((f) => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  roleFilter === f
                    ? "bg-sage text-cream"
                    : "bg-white/50 text-warm-gray border border-sand/50 hover:bg-sage/10"
                }`}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase() + "s"}
              </button>
            ))}
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-sage/30 border-t-sage rounded-full animate-spin mx-auto mb-3" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl border border-sand/50 p-4 hover:border-sage/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-sage">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-moss">{u.name}</p>
                        <p className="text-xs text-warm-gray">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${roleColors[u.role] || ""}`}>
                        {u.role}
                      </span>
                      <span className="text-xs text-warm-gray">
                        {u._count.applications} app{u._count.applications !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-warm-gray">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Roadmap for Students */}
                  {u.role === "STUDENT" && (
                    <div className="mt-3 pt-3 border-t border-sand/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-warm-gray font-medium">Progress Roadmap</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {["Base", "Phase 1", "Phase 2", "Phase 3", "Phase 4"].map((phase, idx) => (
                          <div key={phase} className="flex items-center">
                            <div
                              className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                                idx === 0
                                  ? "bg-sage/20 text-sage-dark"
                                  : "bg-sand/30 text-warm-gray/60"
                              }`}
                            >
                              {phase}
                            </div>
                            {idx < 4 && <div className="w-3 h-px bg-sand mx-0.5" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
