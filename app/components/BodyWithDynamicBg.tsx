"use client";
import { usePathname } from "next/navigation";

export default function BodyWithDynamicBg({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isBookNow = pathname === "/Book-Now";
  const isRegisterOnline = pathname === "/register-online";
  const isDrivingLessons = pathname === "/driving-lessons";
  
  // Para Book-Now, Register-Online y Driving-Lessons, usar fondo blanco
  if (isBookNow || isRegisterOnline || isDrivingLessons) {
    return (
      <div className="bg-white min-h-screen">
        {children}
      </div>
    );
  }
  
  return (
    <div className={isHome ? "bg-transparent" : "bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] min-h-screen"}>
      {children}
    </div>
  );
} 