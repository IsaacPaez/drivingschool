"use client";

import React from "react";
import Image from "next/image";

interface CourseListProps {
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
}

const courses = [
  {
    name: "Law & Substance Abuse",
    key: "lawSubstance",
    img: "/law-substance.jpg",
  },
  {
    name: "Driving Improvement (Basic)",
    key: "basicDriving",
    img: "/basic-driving.jpg",
  },
  {
    name: "Driving Improvement (Intermediate)",
    key: "intermediateDriving",
    img: "/intermediate-driving.jpg",
  },
  {
    name: "Driving Improvement (Advanced)",
    key: "advancedDriving",
    img: "/advanced-driving.jpg",
  },
  {
    name: "Senior Insurance Discount",
    key: "seniorInsurance",
    img: "/seniorInsurance.jpg",
  },
];

const CourseList: React.FC<CourseListProps> = ({
  selectedCourse,
  setSelectedCourse,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {courses.map(({ name, key, img }) => (
        <div
          key={key}
          className={`relative w-[280px] h-[150px] cursor-pointer rounded-xl overflow-hidden shadow-lg transition-transform duration-300 ${
            selectedCourse === key ? "scale-105" : "hover:scale-105"
          }`}
          onClick={() => setSelectedCourse(key)}
        >
          {/* Imagen de Fondo */}
          <Image
            src={img}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0"
          />

          {/* Overlay Oscuro */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p className="text-white text-lg font-bold text-center">{name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
