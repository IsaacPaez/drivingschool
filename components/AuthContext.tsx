"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  photo?: string | null;
  type?: 'student' | 'instructor';
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_KEY = "drivingschool_user";
const INACTIVITY_MINUTES = 30;
const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Restaurar usuario desde localStorage al cargar
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed._id && parsed.email) {
          setUserState(parsed);
        }
      } catch {}
    }
  }, []);

  // Guardar usuario en localStorage cuando cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_KEY);
    }
  }, [user]);

  // Inactividad: reinicia timer en cada interacción
  useEffect(() => {
    if (!user) return;
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setUserState(null);
        localStorage.removeItem(LOCAL_KEY);
        alert("Session expired due to inactivity. Please log in again.");
      }, INACTIVITY_MS);
    };
    // Eventos de actividad
    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (!u) localStorage.removeItem(LOCAL_KEY);
  };

  const logout = () => {
    if (user?.type === 'instructor') {
      router.push('/');
    }
    setUserState(null);
    localStorage.removeItem(LOCAL_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
} 