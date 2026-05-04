"use client";

import { useEffect } from "react";
import Image from "next/image";
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
  BookOpen,
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
    const links = [
      { href: "/", label: "Home", icon: Home },
      { href: "/requirements", label: "Requirements", icon: FileText }
    ];

    if (user?.role === "STUDENT") {
      links.push({ href: "/apply", label: "Apply", icon: FileText });
      links.push({ href: "/my-applications", label: "My Applications", icon: LayoutDashboard });
    }

    if (user?.role === "TEACHER" || user?.role === "ADMIN") {
      links.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
    }

    if (user?.role === "ADMIN") {
      links.push({ href: "/admin/courses", label: "Courses", icon: BookOpen });
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
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-sm shadow-saffron/10 bg-white border border-sand">
              <Image 
                src="/images/dharmachakra_logo.png" 
                alt="Vippassana Bhawana Logo" 
                width={40} 
                height={40} 
                className="object-contain"
                priority
              />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground tracking-wide hidden sm:block">
              Vippassana Bhawana
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
                      ? "bg-saffron/10 text-monk-red"
                      : "text-warm-gray hover:bg-saffron/5 hover:text-saffron"
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
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-saffron/10 text-saffron px-2 py-0.5 rounded-full border border-saffron/20">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-warm-gray hover:bg-saffron/10 hover:text-saffron transition-all duration-300"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-saffron text-cream hover:bg-monk-red transition-all duration-300 shadow-md shadow-saffron/20"
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
            className="md:hidden p-2 rounded-lg text-warm-gray hover:bg-saffron/10"
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-gray hover:bg-saffron/10 hover:text-saffron transition-all"
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
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-gray hover:bg-saffron/10 hover:text-saffron"
                    >
                      <LogIn size={18} />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-saffron text-cream hover:bg-monk-red"
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
