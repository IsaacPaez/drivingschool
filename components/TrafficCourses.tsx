"use client";

import React from "react";
import { useRouter } from "next/navigation";

const TrafficCourses = () => {
  const router = useRouter();

  const courses = [
    {
      title: "Live Classroom",
      details: [
        "Learn with Professional Instruction",
        "Course for first-time drivers",
        "Advanced driving improvement",
        "Insurance discounts for seniors",
        "And more!",
      ],
      buttonText: "View Courses",
      link: "/Classes",
    },
    {
      title: "Online Learning",
      details: [
        "Learn from the Comfort of Your Home",
        "Course for first-time drivers",
        "Advanced driving improvement",
        "Insurance discounts for seniors",
        "And more!",
      ],
      buttonText: "View Online Courses",
      link: "/OnlineCourses",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <section
      className="bg-cover bg-center py-20"
      style={{ backgroundImage: "url('/C1.jpg')" }}
    >
      <h2 className="text-4xl font-extrabold text-center text-black mb-16">
        Traffic Courses
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-20 max-w-4xl mx-auto px-6">
        {courses.map((course, index) => (
          <div
            key={index}
            className="bg-black bg-opacity-50 shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-2"
            style={{
              borderBottomLeftRadius: "15px",
              borderBottomRightRadius: "15px",
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              {course.title}
            </h3>
            <ul className="text-gray-300 text-center mb-6 space-y-2">
              {course.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
            <button
              onClick={() => handleNavigation(course.link)}
              className="bg-[#27ae60] hover:bg-[#0056b3] text-white font-bold text-lg py-3 px-6 rounded-full transition-colors duration-300 mx-auto"
              style={{
                display: "block",
                width: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {course.buttonText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrafficCourses;
