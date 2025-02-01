"use client";

import React from "react";

interface CourseListProps {
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
}

const courses = [
  {
    name: "Law & Substance Abuse",
    key: "lawSubstance",
    img: "/images/law-substance.jpg", // ✅ Asegúrate de que estas imágenes existan en /public/images
  },
  {
    name: "Driving Improvement (Basic)",
    key: "basicDriving",
    img: "/images/driving-basic.jpg",
  },
  {
    name: "Driving Improvement (Intermediate)",
    key: "intermediateDriving",
    img: "/images/driving-intermediate.jpg",
  },
  {
    name: "Driving Improvement (Advanced)",
    key: "advancedDriving",
    img: "/images/driving-advanced.jpg",
  },
  {
    name: "Senior Insurance Discount",
    key: "seniorInsurance",
    img: "/images/senior-discount.jpg",
  },
];

const CourseList: React.FC<CourseListProps> = ({ selectedCourse, setSelectedCourse }) => {
  return (
    <div className="grid grid-cols-5 gap-4 w-full">
      {courses.map(({ name, key, img }) => (
        <div
          key={key}
          className={`relative w-full h-24 cursor-pointer rounded-xl overflow-hidden shadow-lg transition-transform duration-300 ${
            selectedCourse === key ? "scale-105" : "hover:scale-105"
          }`}
          onClick={() => setSelectedCourse(key)}
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay Oscuro */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p className="text-white text-sm font-bold text-center">{name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
