"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flower2, Shield, BookOpen, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import { useAuthStore } from "@/store/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

const features = [
  {
    icon: BookOpen,
    title: "Structured Course Path",
    desc: "Progress from 10-day introductory courses through advanced 60-day retreats with guided eligibility.",
  },
  {
    icon: Shield,
    title: "Secure Applications",
    desc: "Your medical and personal data is handled with utmost care and encrypted end-to-end.",
  },
  {
    icon: Users,
    title: "Teacher Guidance",
    desc: "Experienced Dhamma teachers review every application and provide personalized guidance.",
  },
];

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ZenBackground />

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-4 py-20 sm:py-32">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage/10 text-sage-dark text-xs font-medium tracking-wider uppercase">
              <Flower2 size={14} />
              Walk the Noble Path
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-moss leading-tight mb-6"
          >
            Dhamma Meditation
            <br />
            <span className="text-sage">Management System</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-warm-gray text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A mindful platform for managing Vipassana meditation course applications,
            student progress tracking, and teacher approvals — designed with the
            serenity of the Dhamma tradition.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link
                href={user.role === "STUDENT" ? "/apply" : "/dashboard"}
                className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-sage text-cream font-medium text-base hover:bg-sage-dark transition-all duration-500 shadow-lg shadow-sage/20"
              >
                {user.role === "STUDENT" ? "Apply for a Course" : "Go to Dashboard"}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-sage text-cream font-medium text-base hover:bg-sage-dark transition-all duration-500 shadow-lg shadow-sage/20"
                >
                  Begin Your Journey
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-full border border-sage/30 text-sage-dark font-medium text-base hover:bg-sage/10 transition-all duration-500"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-sand/40 hover:border-sage/30 hover:shadow-lg hover:shadow-sage/5 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-sage" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-moss mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Course Progression Overview */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="font-serif text-3xl font-bold text-moss mb-4"
          >
            The Path of Practice
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="text-warm-gray mb-12 max-w-2xl mx-auto"
          >
            Progress through carefully structured phases, each building upon the
            foundation of your practice.
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { phase: "Base", desc: "10-Day Introductory Course", color: "bg-sage/10 border-sage/20" },
              { phase: "Phase 1", desc: "5× 10-Day + Service + Satipatthana", color: "bg-earth/10 border-earth/20" },
              { phase: "Phase 2", desc: "20-Day → 30-Day Long Courses", color: "bg-gold/10 border-gold/20" },
              { phase: "Phase 4", desc: "45-Day → 60-Day Advanced", color: "bg-moss/10 border-moss/20" },
            ].map((item, i) => (
              <motion.div
                key={item.phase}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className={`rounded-xl p-6 border ${item.color} transition-all duration-500 hover:scale-105`}
              >
                <div className="text-xs font-medium uppercase tracking-wider text-warm-gray mb-2">
                  {item.phase}
                </div>
                <div className="font-serif text-sm font-semibold text-moss">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sand/50 bg-cream-dark/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
              <path d="M20 5 C25 12, 32 16, 20 35 C8 16, 15 12, 20 5Z" fill="#7A8B6F" />
            </svg>
            <span className="font-serif text-sm font-semibold text-moss">Dhamma Path</span>
          </div>
          <p className="text-xs text-warm-gray">
            May all beings be happy, peaceful, and liberated.
          </p>
          <p className="text-[10px] text-warm-gray/60 mt-2">
            Data handled with care under strict privacy protocols. SSL encrypted.
          </p>
        </div>
      </footer>
    </div>
  );
}
