"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import PhoneInput from "@/components/PhoneInput";
import { useAuthStore } from "@/store/auth";
import { validatePhone } from "@/lib/phone-validation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    const success = await login(identifier, phone);
    if (success) {
      router.push("/");
      router.refresh();
    } else {
      setError("No account found with these details");
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
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center mx-auto mb-4">
                      <LogIn size={24} className="text-saffron" />
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-foreground lining-nums">
                      Welcome Back
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
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        ID Card or Passport Number
                      </label>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm transition-all duration-300"
                        placeholder="e.g. 123456789V"
                      />
                    </div>

                    <PhoneInput
                      label="Phone Number"
                      value={phone}
                      onChange={setPhone}
                      required
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-saffron text-cream font-medium text-sm hover:bg-saffron-dark transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>

                  <div className="text-center mt-6 space-y-2">
                    <p className="text-sm text-warm-gray">
                      New to the path?{" "}
                      <Link href="/register" className="text-saffron-dark font-medium hover:underline">
                        Create an account
                      </Link>
                    </p>
                    <p className="text-sm text-warm-gray">
                      Need help?{" "}
                      <span className="text-saffron-dark font-medium cursor-help" title="Call Admin at +94 11 222 3333">
                        Contact Admin (+94 11 222 3333)
                      </span>
                    </p>
                  </div>
                </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
