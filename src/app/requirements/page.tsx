import Navbar from "@/components/Navbar";
import ZenBackground from "@/components/ZenBackground";
import CourseRequirements from "@/components/CourseRequirements";

export default function RequirementsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <ZenBackground />
      <main className="flex-1 pt-12 relative z-10">
        <CourseRequirements />
      </main>
      <footer className="relative z-10 border-t border-sand/50 bg-cream-dark/50 backdrop-blur-sm mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-xs text-warm-gray">
            May all beings be happy, peaceful, and liberated.
          </p>
        </div>
      </footer>
    </div>
  );
}
