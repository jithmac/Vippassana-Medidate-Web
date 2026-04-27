"use client";

export default function ZenBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Lotus SVG floating slowly */}
      <svg
        className="absolute top-[10%] right-[5%] w-32 h-32 animate-float opacity-[0.07]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 20 C120 60, 160 80, 100 180 C40 80, 80 60, 100 20Z"
          fill="#7A8B6F"
        />
        <path
          d="M100 40 C70 70, 30 100, 100 180 C170 100, 130 70, 100 40Z"
          fill="#9BAF8B"
          opacity="0.6"
        />
        <circle cx="100" cy="120" r="12" fill="#C4A265" opacity="0.5" />
      </svg>

      {/* Water ripple circles */}
      <div className="absolute bottom-[10%] left-[10%]">
        <div className="w-40 h-40 rounded-full border border-sage/10 animate-ripple" />
        <div
          className="absolute inset-4 rounded-full border border-sage/10 animate-ripple"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute inset-8 rounded-full border border-sage/10 animate-ripple"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Gentle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-transparent to-cream-dark/30" />

      {/* Second lotus, bottom right */}
      <svg
        className="absolute bottom-[20%] right-[15%] w-24 h-24 animate-float opacity-[0.05]"
        style={{ animationDelay: "3s" }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 20 C120 60, 160 80, 100 180 C40 80, 80 60, 100 20Z"
          fill="#8B7355"
        />
      </svg>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/20 animate-gentle-pulse"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 18}%`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}
