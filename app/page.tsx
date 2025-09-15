"use client";
import Hero from "@/components/Hero";
import Body from "@/components/Body";
import Learn from "@/components/Learn";
import DrivingLessons from "@/components/DrivingLessons";
import TrafficCourses from "@/components/TrafficCourses";
import Resources from "@/components/Resources";
import AreasWeServe from "@/components/AreasWeServe";
import AuthRedirector from "@/components/AuthRedirector";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useAutoStartEC2 } from "@/hooks/useAutoStartEC2";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Iniciar EC2 automáticamente
  useAutoStartEC2();

  useEffect(() => {
    if (user && user.type === "instructor") {
      router.replace("/myschedule");
    }
  }, [user, router]);

  return (
    <>
      <AuthRedirector />
      <div>
        <Hero />
        <Body />
        <Learn />
        <DrivingLessons category="General" />
        <TrafficCourses />
        <Resources />
        <AreasWeServe />
      </div>
    </>
  );
}
