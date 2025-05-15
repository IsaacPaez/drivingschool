"use client";
import Hero from "@/components/Hero";
import Body from "@/components/Body";
import Learn from "@/components/Learn";
import DrivingLessons from "@/components/DrivingLessons";
import TrafficCourses from "@/components/TrafficCourses";
import Resources from "@/components/Resources";
import AreasWeServe from "@/components/AreasWeServe";
import AuthRedirector from "./components/AuthRedirector";

export default function Home() {
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
