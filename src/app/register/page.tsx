"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import PhoneInput from "@/components/PhoneInput";
import { useAuthStore } from "@/store/auth";
import { validatePhone } from "@/lib/phone-validation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
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
    if (!country.trim()) {
      setError("Country is required");
      return;
    }
    if (!address.trim()) {
      setError("Address is required");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number for the selected country");
      return;
    }

    setLoading(true);
    const success = await register(name, country, address, idCardNumber, phone);
    if (success) {
      router.push("/");
      router.refresh();
    } else {
      setError("Registration failed. ID may already be registered.");
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
                <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm"
                  placeholder="Your country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm"
                  placeholder="Your full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">ID Card or Passport Number</label>
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
