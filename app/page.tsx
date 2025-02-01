import Hero from "@/components/Hero";
import Body from "@/components/Body";
import Learn from "@/components/Learn";
import DrivingLessons from "@/components/DrivingLessons";
import TrafficCourses from "@/components/TrafficCourses";
import Resources from "@/components/Resources";
import AreasWeServe from "@/components/AreasWeServe";

export default function Home() {
  return (
    <>
      <Hero />
      <Body />
      <Learn />
      <DrivingLessons category="General" />
      <TrafficCourses />
      <Resources />
      <AreasWeServe />
    </>
  );
}
