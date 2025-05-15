"use client";
import { usePathname } from "next/navigation";

export default function BodyWithDynamicBg({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <div className={isHome ? "bg-transparent" : "bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] min-h-screen"}>
      {children}
    </div>
  );
} 