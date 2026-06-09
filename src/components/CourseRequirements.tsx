"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

const requirements = [
  {
    course: "10-Day Course",
    prevCourses: "None required for new students. Returning students must have completed their last course.",
    practicePeriod: "N/A",
    dailyPractice: "Commitment to learn and practice during the course.",
    devotion: "Willingness to follow the code of discipline.",
    conduct: "Must remain on the course site and follow rules for the entire 10 days.",
    notes: "Returning students are subject to a mandatory 10-day waiting period from the completion date of their last course before they are eligible to apply again.",
  },
  {
    course: "20-Day Course",
    prevCourses: "More than five (5) previous 10-day courses completed.",
    practicePeriod: "Dependent on completion of 10-day courses.",
    dailyPractice: "Established daily practice.",
    devotion: "Committed to this method and separate from other meditation practices.",
    conduct: "Maintaining the 5 precepts.",
    notes: "A mandatory 10-day waiting period applies from the completion of your last course. You must pass review by Area and Previous Teachers.",
  },
  {
    course: "30-Day Course",
    prevCourses: "More than six (6) previous 10-day courses AND at least one (1) 20-day course completed.",
    practicePeriod: "Significant long-term practice.",
    dailyPractice: "Established daily practice.",
    devotion: "Committed exclusively to this method.",
    conduct: "Maintaining the 5 precepts.",
    notes: "A mandatory 10-day waiting period applies from the completion of your last course. You must pass review by Area and Previous Teachers.",
  },
  {
    course: "Dhamma Sewa (Service)",
    prevCourses: "At least one (1) previous course completed.",
    practicePeriod: "N/A",
    dailyPractice: "N/A",
    devotion: "Willingness to serve the Dhamma.",
    conduct: "Following the code of discipline while serving.",
    notes: "A mandatory 10-day waiting period applies from the completion of your last course.",
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
