"use client";

import { create } from "zustand";

interface User {
  id?: string;
  userId?: string;
  email: string;
  name: string;
  role: string;
  currentStage?: number;
  phone?: string;
  birthday?: string;
  idCardNumber?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (name: string, phone: string, idCardNumber: string, password: string, birthday: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  login: async (identifier, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({ user: data.user });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name, phone, idCardNumber, password, birthday) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, idCardNumber, password, birthday }),
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
