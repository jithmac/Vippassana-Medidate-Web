"use client";

import Link from "next/link";
import Image from "next/image";
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
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  })
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  })
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  })
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
      <section className="relative flex-1 flex items-center justify-center px-4 pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
        {/* Solid Background to prevent global mandalas from clashing with the hero image */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#FFFBF2] to-[#FDF4E3]" />
        
        {/* Subtle Background Image */}
        <div className="absolute inset-0 z-0 opacity-[0.15] mix-blend-multiply pointer-events-none">
          <Image
            src="/images/buddhist_temple_bg.png"
            alt="Temple Background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#FFFBF2]/50 to-[#FFFBF2] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron/10 text-saffron text-xs font-medium tracking-wider uppercase border border-saffron/20 shadow-sm shadow-saffron/5">
              <Flower2 size={14} />
              Walk the Noble Path
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Vippassana
            <br />
            <span className="text-saffron">Bhawana</span>
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
                className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-saffron text-cream font-medium text-base hover:bg-monk-red transition-all duration-500 shadow-lg shadow-saffron/20"
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
                  className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-saffron text-cream font-medium text-base hover:bg-monk-red transition-all duration-500 shadow-lg shadow-saffron/20"
                >
                  Begin Your Journey
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-full border border-saffron/30 text-saffron font-medium text-base hover:bg-saffron/10 transition-all duration-500"
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
                  viewport={{ once: true, margin: "-50px" }}
                  variants={scaleUp}
                  custom={i}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-saffron/10 hover:border-saffron/30 hover:shadow-lg hover:shadow-saffron/5 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-saffron" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
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
            className="font-serif text-3xl font-bold text-foreground mb-4"
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

          <div className="relative max-w-3xl mx-auto mt-16">
            {/* Connecting Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-saffron/30 via-gold/30 to-transparent hidden md:block" />

            <div className="space-y-8 md:space-y-12">
              {[
                { phase: "Base", desc: "10-Day Introductory Course", color: "bg-sand/30 border-sand/50", align: "left" },
                { phase: "Phase 1", desc: "5× 10-Day + Service + Satipatthana", color: "bg-saffron/10 border-saffron/20", align: "right" },
                { phase: "Phase 2", desc: "20-Day → 30-Day Long Courses", color: "bg-gold/20 border-gold/30", align: "left" },
                { phase: "Phase 4", desc: "45-Day → 60-Day Advanced", color: "bg-monk-red/10 border-monk-red/20", align: "right" },
              ].map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={item.align === "left" ? slideInLeft : slideInRight}
                  custom={i}
                  className={`relative flex flex-col md:flex-row items-center gap-6 ${item.align === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Timeline Dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cream border-2 border-saffron shadow-[0_0_10px_rgba(212,128,55,0.4)] z-10" />

                  <div className={`w-full md:w-1/2 ${item.align === "left" ? "md:pr-12 text-center md:text-right" : "md:pl-12 text-center md:text-left"}`}>
                    <div className={`group relative inline-block w-full max-w-sm rounded-2xl p-8 border ${item.color} backdrop-blur-md shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-saffron/10 overflow-hidden cursor-default`}>
                      {/* Decorative glowing gradient inside card */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-saffron/80 mb-3 flex items-center gap-2 lining-nums">
                          <span className="w-4 h-px bg-saffron/30" />
                          {item.phase}
                        </div>
                        <div className="font-serif text-xl md:text-2xl font-medium text-foreground leading-tight group-hover:text-monk-red transition-colors duration-500 lining-nums">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sand/50 bg-cream-dark/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-sand">
              <Image 
                src="/images/dharmachakra_logo.png" 
                alt="Vippassana Bhawana Logo" 
                width={28} 
                height={28} 
                className="object-contain"
              />
            </div>
            <span className="font-serif text-sm font-semibold text-foreground">Vippassana Bhawana</span>
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
