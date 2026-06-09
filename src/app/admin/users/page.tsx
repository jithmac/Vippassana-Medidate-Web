"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, BookOpen, User as UserIcon, Plus, X, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";

interface UserData {
  id: string;
  name: string;
  idPassportNumber: string;
  phoneNumber: string;
  role: string;
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
  const [newTeacherId, setNewTeacherId] = useState("");
  const [newTeacherPhone, setNewTeacherPhone] = useState("");
  const [newTeacherRole, setNewTeacherRole] = useState("NEW_TEACHER");
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
        body: JSON.stringify({ 
          name: newTeacherName, 
          idPassportNumber: newTeacherId, 
          phoneNumber: newTeacherPhone,
          role: newTeacherRole
        }),
      });
      if (res.ok) {
        setShowTeacherModal(false);
        setNewTeacherName("");
        setNewTeacherId("");
        setNewTeacherPhone("");
        fetchUsers();
      } else {
        alert("Failed to create teacher.");
      }
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
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
              <p className="text-sm text-warm-gray">Manage all registered users.</p>
            </div>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron text-cream text-sm font-medium hover:bg-saffron-dark transition-all duration-300 shadow-lg shadow-saffron/20"
            >
              <Plus size={16} />
              Add Teacher
            </button>
          </div>

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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-warm-gray">
                        {u.idPassportNumber && <span>ID: {u.idPassportNumber}</span>}
                        {u.phoneNumber && <span>Phone: {u.phoneNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${roleColors[u.role] || ""}`}>
                      {u.role}
                    </span>
                    <span className="text-xs text-warm-gray px-2 border-l border-sand">
                      {u._count?.applications || 0} app{u._count?.applications !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-warm-gray px-2 border-l border-sand hidden sm:inline-block">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

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
                  <label className="block text-sm font-medium text-foreground mb-1">ID / Passport Number</label>
                  <input
                    type="text"
                    required
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newTeacherPhone}
                    onChange={(e) => setNewTeacherPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Teacher Role</label>
                  <select
                    value={newTeacherRole}
                    onChange={(e) => setNewTeacherRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-foreground text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  >
                    <option value="NEW_TEACHER">New Teacher (Reviewer)</option>
                    <option value="PREVIOUS_TEACHER">Previous Teacher (Reviewer & Enrollment)</option>
                    <option value="AREA_TEACHER">Area Teacher (Final Approval)</option>
                  </select>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
