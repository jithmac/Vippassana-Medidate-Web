"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  LayoutDashboard,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, loading, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navLinks = () => {
    const links = [{ href: "/", label: "Home", icon: Home }];

    if (user?.role === "STUDENT") {
      links.push({ href: "/apply", label: "Apply", icon: FileText });
      links.push({ href: "/my-applications", label: "My Applications", icon: LayoutDashboard });
    }

    if (user?.role === "TEACHER" || user?.role === "ADMIN") {
      links.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
    }

    if (user?.role === "ADMIN") {
      links.push({ href: "/admin/users", label: "Users", icon: Users });
    }

    return links;
  };

  if (loading) return null;

  return (
    <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-sand/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-sage/20 flex items-center justify-center group-hover:bg-sage/30 transition-colors duration-500">
              <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
                <path
                  d="M20 5 C25 12, 32 16, 20 35 C8 16, 15 12, 20 5Z"
                  fill="#7A8B6F"
                />
                <circle cx="20" cy="22" r="3" fill="#C4A265" opacity="0.6" />
              </svg>
            </div>
            <span className="font-serif text-lg font-semibold text-moss tracking-wide hidden sm:block">
              Dhamma Path
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks().map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                    isActive
                      ? "bg-sage/20 text-moss"
                      : "text-warm-gray hover:bg-sage/10 hover:text-moss"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-warm-gray">Signed in as</p>
                  <p className="text-sm font-medium text-moss">{user.name}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-sage/20 text-sage-dark px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-warm-gray hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-warm-gray hover:bg-sage/10 transition-all duration-300"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-sage text-cream hover:bg-sage-dark transition-all duration-300"
                >
                  <UserPlus size={16} />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-warm-gray hover:bg-sage/10"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-sand/50 bg-cream/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks().map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-gray hover:bg-sage/10 hover:text-moss transition-all"
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-sand/50">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-gray hover:bg-sage/10"
                    >
                      <LogIn size={18} />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-sage text-cream"
                    >
                      <UserPlus size={18} />
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
