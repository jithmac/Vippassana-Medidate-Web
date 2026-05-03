"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Eye, EyeOff, Shield, BookOpen, User as UserIcon, ArrowLeft, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import PhoneInput from "@/components/PhoneInput";
import { useAuthStore } from "@/store/auth";
import { validatePhone } from "@/lib/phone-validation";

export default function LoginPage() {
  const [role, setRole] = useState<"ADMIN" | "TEACHER" | "STUDENT" | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"id" | "phone">("id");
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (loginMethod === "phone" && !validatePhone(identifier)) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    const success = await login(identifier, password);
    if (success) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sand/50 p-8 shadow-xl shadow-saffron/5 overflow-hidden">
            <AnimatePresence mode="wait">
              {!role ? (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center mx-auto mb-4">
                      <LogIn size={24} className="text-saffron" />
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-foreground lining-nums">Welcome to Dhamma</h1>
                    <p className="text-sm text-warm-gray mt-1">Please select your role to continue</p>
                  </div>

                  <div className="grid gap-4">
                    <button
                      onClick={() => setRole("STUDENT")}
                      className="flex items-center gap-4 p-4 rounded-xl border border-sand bg-white/50 hover:bg-saffron/5 hover:border-saffron/30 transition-all duration-300 text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <UserIcon size={20} className="text-saffron" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Student</h3>
                        <p className="text-xs text-warm-gray mt-0.5">Login with ID Card Number</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setRole("TEACHER")}
                      className="flex items-center gap-4 p-4 rounded-xl border border-sand bg-white/50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Teacher</h3>
                        <p className="text-xs text-warm-gray mt-0.5">Login with Email or ID</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setRole("ADMIN")}
                      className="flex items-center gap-4 p-4 rounded-xl border border-sand bg-white/50 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Shield size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Admin</h3>
                        <p className="text-xs text-warm-gray mt-0.5">Login with Email Address</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => { setRole(null); setError(""); setIdentifier(""); setPassword(""); }}
                    className="flex items-center gap-2 text-sm text-warm-gray hover:text-foreground transition-colors mb-6"
                  >
                    <ArrowLeft size={16} />
                    Back to Roles
                  </button>

                  <div className="text-center mb-8">
                    <h1 className="font-serif text-2xl font-bold text-foreground lining-nums">
                      {role === "ADMIN" ? "Admin Login" : role === "TEACHER" ? "Teacher Login" : "Student Login"}
                    </h1>
                    <p className="text-sm text-warm-gray mt-1">Continue your path of practice</p>
                  </div>

                  {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-foreground">
                          {role === "ADMIN" ? "Email Address" : role === "TEACHER" ? (loginMethod === "id" ? "Email or ID Card Number" : "Phone Number") : (loginMethod === "id" ? "ID Card Number" : "Phone Number")}
                        </label>
                        {role !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => {
                              setLoginMethod(loginMethod === "id" ? "phone" : "id");
                              setIdentifier("");
                            }}
                            className="text-[10px] uppercase tracking-wider font-bold text-saffron-dark hover:underline"
                          >
                            {loginMethod === "id" ? "Use Phone Instead" : "Use Email/ID Instead"}
                          </button>
                        )}
                      </div>
                      {loginMethod === "phone" && role !== "ADMIN" ? (
                        <PhoneInput
                          value={identifier}
                          onChange={setIdentifier}
                          required
                        />
                      ) : (
                        <input
                          type={role === "ADMIN" ? "email" : "text"}
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm transition-all duration-300"
                          placeholder={role === "ADMIN" ? "admin@dhamma.org" : role === "TEACHER" ? "teacher@dhamma.org or TEACHER123" : "e.g. 123456789V or STUDENT123"}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm transition-all duration-300 pr-10"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-foreground"
                        >
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-saffron text-cream font-medium text-sm hover:bg-saffron-dark transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>

                  <div className="text-center mt-6 space-y-2">
                    {role === "STUDENT" && (
                      <p className="text-sm text-warm-gray">
                        New to the path?{" "}
                        <Link href="/register" className="text-saffron-dark font-medium hover:underline">
                          Create an account
                        </Link>
                      </p>
                    )}
                    <p className="text-sm text-warm-gray">
                      Forgot password?{" "}
                      <span className="text-saffron-dark font-medium cursor-help" title="Call Admin at +94 11 222 3333">
                        Contact Admin (+94 11 222 3333)
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 p-3 rounded-xl bg-saffron/5 border border-saffron/10">
                    <p className="text-xs text-warm-gray text-center leading-relaxed">
                      <strong>Demo accounts:</strong><br />
                      Admin: admin@dhamma.org / admin123<br />
                      Teacher: TEACHER123 / password123<br />
                      Student: STUDENT123 / password123
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
