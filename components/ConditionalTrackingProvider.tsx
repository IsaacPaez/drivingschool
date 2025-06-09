"use client";
import { usePathname } from "next/navigation";
import TrackingProvider from "@/components/TrackingProvider";

export default function ConditionalTrackingProvider() {
  const pathname = usePathname() || "";
  const isTeacherRoute = pathname.startsWith("/teachers");
  if (isTeacherRoute) return null;
  return <TrackingProvider />;
} 