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
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};



const scaleUp = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
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
              className="text-warm-gray mb-8 max-w-2xl mx-auto"
            >
              Progress through carefully structured phases, each building upon the
              foundation of your practice.
            </motion.p>
            
            {/* Removed currentStage logic since eligibility is calculated dynamically */}
          </div>

          <div className="relative mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { phase: "10-Day Course", desc: "Foundation of practice. Open to all new and returning students.", num: 10 },
                { phase: "20-Day Course", desc: "Advanced practice. Requires completion of more than 5 10-day courses.", num: 20 },
                { phase: "30-Day Course", desc: "Deep meditation. Requires completion of >6 10-day and 1 20-day course.", num: 30 },
                { phase: "Dhamma Sewa", desc: "Selfless service. Open to those who have completed at least one 10-day course.", num: 0 },
              ].map((item, i) => {
                return (
                  <motion.div
                    key={item.phase}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-20px" }}
                    variants={scaleUp}
                    custom={i}
                    className="group relative p-6 rounded-3xl border backdrop-blur-md transition-all duration-500 flex flex-col justify-between min-h-[200px] bg-white/40 border-sand/40 opacity-80 hover:opacity-100 hover:bg-white/60"
                  >
                    {/* Background large decorative number (Contained within rounded corners) */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                      <div className="absolute -right-2 -bottom-4 text-[100px] leading-none font-serif font-bold select-none z-0 transition-colors duration-500 text-warm-gray/5 group-hover:text-warm-gray/10">
                        {item.num === 0 ? "♥" : item.num}
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                      <div className="flex items-start justify-between">
                        <div className="font-serif text-3xl sm:text-4xl font-light leading-none tracking-tight transition-colors duration-500 text-warm-gray/40 group-hover:text-warm-gray/60">
                          {item.num === 0 ? "Service" : `${item.num}-Day`}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 transition-colors duration-500 text-warm-gray/60">
                          {item.phase}
                        </div>
                        <div className="text-[14px] leading-relaxed transition-colors duration-500 text-warm-gray font-normal">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sand/50 bg-cream-dark/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-sand">
              <Image 
                src="/images/dharmachakra_logo.png" 
                alt="Vippassana Bhawana Logo" 
                width={32} 
                height={32} 
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
