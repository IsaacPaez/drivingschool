"use client";

import React, { useEffect, useState } from "react";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  price: number;
  buttonLabel?: string;
}

const DrivingLessons = ({ category }: { category: string }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    };

    fetchLessons();
  }, [category]);

  return (
    <section className="bg-transparent bg-center py-20">
      {/* Espaciado fijo para el título */}
      <div className="h-[64px] flex items-center justify-center mb-16">
        {category === "General" && (
          <h2 className="text-5xl font-extrabold text-center text-white">
            Our Driving Lessons
          </h2>
        )}
      </div>

      {/* Contenedor con Grid dinámico */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-20  justify-center">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="max-w-[350px] min-w-[280px] mx-auto bg-black bg-opacity-50 rounded-lg shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-2"
            >
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {lesson.title}
              </h3>
              <p className="text-base text-gray-300 mb-4 text-center">
                {lesson.description}
              </p>
              <p className="text-3xl font-bold text-[#27ae60] mb-6 text-center">
                ${lesson.price}
              </p>
              <button className="bg-[#27ae60] hover:bg-[#0056b3] text-white font-bold text-lg py-3 px-6 rounded-full w-full transition-colors duration-300">
                {lesson.buttonLabel || "Buy Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DrivingLessons;
