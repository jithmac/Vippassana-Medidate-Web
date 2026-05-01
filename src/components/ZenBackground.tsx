"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ZenBackground() {
  const [mounted, setMounted] = useState(false);
  const [orbs, setOrbs] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setOrbs(
      [...Array(8)].map((_, i) => ({
        top: `${10 + Math.random() * 80}%`,
        left: `${5 + Math.random() * 90}%`,
        width: `${4 + Math.random() * 6}px`,
        height: `${4 + Math.random() * 6}px`,
        backgroundColor: i % 2 === 0 ? "var(--color-gold)" : "var(--color-saffron)",
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${6 + Math.random() * 4}s`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#FFFBF2] to-[#FDF4E3]">
      {/* Subtle Mandala Background */}
      <div className="absolute top-[5%] right-[-10%] opacity-[0.20] mix-blend-multiply filter contrast-[2] brightness-[1.5] grayscale animate-lotus">
        <Image
          src="/images/mandala_asset.png"
          alt="Mandala"
          width={800}
          height={800}
          priority
        />
      </div>

      {/* Second Mandala, bottom left */}
      <div className="absolute bottom-[-15%] left-[-5%] opacity-[0.15] mix-blend-multiply filter contrast-[2] brightness-[1.5] grayscale animate-lotus" style={{ animationDirection: "reverse", animationDuration: "60s" }}>
        <Image
          src="/images/mandala_asset.png"
          alt="Mandala"
          width={600}
          height={600}
          priority
        />
      </div>

      {/* Water ripple circles but in warm tones */}
      <div className="absolute bottom-[20%] right-[20%]">
        <div className="w-64 h-64 rounded-full border border-saffron/10 animate-ripple" />
        <div
          className="absolute inset-8 rounded-full border border-gold/10 animate-ripple"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute inset-16 rounded-full border border-monk-red/5 animate-ripple"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Gentle gradient overlay to blend */}
      <div className="absolute inset-0 bg-gradient-to-t from-cream-dark/40 via-transparent to-transparent" />

      {/* Floating light orbs (warm tone) */}
      {mounted && orbs.map((style, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float opacity-40 blur-[2px]"
          style={style}
        />
      ))}
    </div>
  );
}
