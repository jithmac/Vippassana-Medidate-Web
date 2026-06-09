"use client";

import { create } from "zustand";

export interface User {
  id?: string;
  userId?: string;
  name: string;
  country: string;
  address: string;
  idPassportNumber: string;
  phone: string;
  role: string;
  personalInfo?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (idPassportNumber: string, phone: string) => Promise<boolean>;
  register: (name: string, country: string, address: string, idPassportNumber: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  login: async (idPassportNumber, phone) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPassportNumber, phone }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({ user: data.user });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name, country, address, idPassportNumber, phone) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, country, address, idPassportNumber, phone }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({ user: data.user });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
