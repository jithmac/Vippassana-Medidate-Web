"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import PhoneInput from "@/components/PhoneInput";
import { useAuthStore } from "@/store/auth";
import { validatePhone } from "@/lib/phone-validation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter a valid full name");
      return;
    }
    if (!idCardNumber.trim()) {
      setError("ID Card/Passport Number is required");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number for the selected country");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!birthday) {
      setError("Birthday is required");
      return;
    }
    const birthDate = new Date(birthday);
    const today = new Date();
    if (birthDate > today) {
      setError("Birthday cannot be in the future");
      return;
    }
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 12) {
      setError("You must be at least 12 years old to register");
      return;
    }

    setLoading(true);
    const success = await register(name, phone, idCardNumber, password, birthday);
    if (success) {
      router.push("/");
      router.refresh();
    } else {
      setError("Email may already be registered. Please try again.");
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
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sand/50 p-8 shadow-xl shadow-saffron/5">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus size={24} className="text-saffron" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground lining-nums">Begin Your Journey</h1>
              <p className="text-sm text-warm-gray mt-1">Create your student account</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">ID Card Number</label>
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm"
                  placeholder="e.g. 123456789V"
                />
              </div>

              <PhoneInput
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Birthday</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm pr-10"
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-saffron text-cream font-medium text-sm hover:bg-saffron-dark transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-warm-gray">
                Already have an account?{" "}
                <Link href="/login" className="text-saffron-dark font-medium hover:underline">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-warm-gray">
                Need help?{" "}
                <span className="text-saffron-dark font-medium cursor-help" title="Call Admin at +94 11 222 3333">
                  Contact Admin (+94 11 222 3333)
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
