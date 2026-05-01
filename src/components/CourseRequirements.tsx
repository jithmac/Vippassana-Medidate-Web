"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  }),
};

const requirements = [
  {
    course: "20-Day Course",
    prevCourses: "Five 10-day courses, one 10-day Dhamma service, and a Satipatthana course.",
    practicePeriod: "2 years",
    dailyPractice: "At least 2 hours of daily practice for the last 2 years.",
    devotion: "Committed to this method and separate from other meditation practices.",
    conduct: "Maintaining the 5 precepts for the last year; abstinence from intoxicants, meat, and sexual misconduct for at least 6 months.",
    notes: "Practice must be continuous. Recommendation from a teacher/assistant is required. At least 6 months must have passed since the last 10-day course.",
  },
  {
    course: "30-Day Course",
    prevCourses: "Six 10-day courses (one after 20-day), and one 20-day course.",
    practicePeriod: "2 years",
    dailyPractice: "At least 2 hours of daily practice for the last 2 years.",
    devotion: "Committed to this method and separate from other meditation practices.",
    conduct: "Maintaining the 5 precepts for the last year; abstinence from intoxicants, meat, and sexual misconduct for at least 6 months.",
    notes: "Practice must be continuous. Recommendation from a teacher/assistant is required. At least 6 months must have passed since the last 10-day course. Must have completed a 10-day course after the 20-day course.",
  },
  {
    course: "45-Day Course",
    prevCourses: "Seven 10-day courses (one after 30-day), and one 30-day course. Must have served at least two 10-day courses.",
    practicePeriod: "3 years",
    dailyPractice: "At least 2 hours of daily practice for the last 2 years.",
    devotion: "Committed to this method and separate from other meditation practices.",
    conduct: "Maintaining the 5 precepts for the last year; abstinence from intoxicants, meat, and sexual misconduct for at least 6 months.",
    notes: "Practice must be continuous. Recommendation from a teacher/assistant is required. At least 6 months must have passed since the last 10-day course. Must have completed a 10-day course after the 30-day course.",
  },
  {
    course: "60-Day Course",
    prevCourses: "Two 45-day courses. Must have served multiple 10-day courses.",
    practicePeriod: "5 years",
    dailyPractice: "At least 2 hours of daily practice for the last 2 years.",
    devotion: "Committed to this method and separate from other meditation practices.",
    conduct: "Maintaining the 5 precepts for the last year; abstinence from intoxicants, meat, and sexual misconduct for at least 6 months.",
    notes: "Practice must be continuous. Recommendation from a teacher/assistant is required. At least 6 months must have passed since the last 10-day course.",
  },
  {
    course: "Special 10-Day Course",
    prevCourses: "Five 10-day courses, one 10-day Dhamma service, and a Satipatthana course.",
    practicePeriod: "2 years",
    dailyPractice: "At least 2 hours of daily practice for the last 2 years.",
    devotion: "Committed to this method and separate from other meditation practices.",
    conduct: "Maintaining the 5 precepts for the last year; abstinence from intoxicants, meat, and sexual misconduct for at least 6 months.",
    notes: "This course is not for new students. Recommendation required. Students must not have participated in other meditation practices for at least 6 months.",
  },
];

export default function CourseRequirements() {
  return (
    <section className="relative z-10 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Course Requirements</h2>
          <p className="text-warm-gray max-w-2xl mx-auto">
            Detailed eligibility criteria for advanced Vipassana meditation courses.
          </p>
        </motion.div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {requirements.map((req, i) => (
            <motion.div
              key={req.course}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i + 1}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-saffron/20 p-6 md:p-8 shadow-xl shadow-saffron/5 hover:border-saffron/40 transition-colors duration-300"
            >
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6 pb-4 border-b border-saffron/20 lining-nums">
                {req.course}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
                <div>
                  <h4 className="font-medium text-saffron uppercase tracking-wider text-xs mb-2">
                    Minimum Previous Courses
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {req.prevCourses}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-saffron uppercase tracking-wider text-xs mb-2">
                    Practice Period
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {req.practicePeriod}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-saffron uppercase tracking-wider text-xs mb-2">
                    Daily Practice & Experience
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {req.dailyPractice}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-saffron uppercase tracking-wider text-xs mb-2">
                    Devotion & Discipline
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {req.devotion}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-saffron uppercase tracking-wider text-xs mb-2">
                    Character and Conduct
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {req.conduct}
                  </p>
                </div>
              </div>

              {req.notes && (
                <div className="mt-6 bg-saffron/5 rounded-xl p-4 border border-saffron/10">
                  <h4 className="font-semibold text-saffron-dark uppercase tracking-widest text-[10px] mb-1">
                    Notes
                  </h4>
                  <p className="text-warm-gray text-xs leading-relaxed italic">
                    {req.notes}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
