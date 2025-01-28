"use client";

import React from "react";

const DrivingLessons = () => {
  const lessons = [
    {
      title: "Individual Lesson",
      description: "The easiest one, 1 driving lesson of 2 hours.",
      price: "$170",
      buttonLabel: "Book Lesson",
    },
    {
      title: "8-Hour Package",
      description: "3 driving lessons of 2 hours: Save $120!",
      price: "$680",
      buttonLabel: "Buy 8-Hour Package",
    },
    {
      title: "12-Hour Package",
      description: "6 driving lessons of 2 hours: Save $180!",
      price: "$800",
      buttonLabel: "Buy 12-Hour Package",
    },
    {
      title: "Road Test Service",
      description: "Vehicle and road test at our facilities.",
      price: "$100",
      buttonLabel: "View Details",
    },
  ];

  return (
    <section
      className="bg-cover bg-center py-20"
      style={{ backgroundImage: "url('/Lessons.jpg')" }} // Asegúrate de usar el path correcto para la imagen de fondo.
    >
      <h2 className="text-5xl font-extrabold text-center text-white mb-16">
        Our Driving Lessons
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {lessons.map((lesson, index) => (
          <div
            key={index}
            className="bg-black bg-opacity-50 shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-2"
            style={{
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              borderBottomLeftRadius: "25px",
              borderBottomRightRadius: "25px",
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              {lesson.title}
            </h3>
            <p className="text-base text-gray-300 mb-4 text-center">
              {lesson.description}
            </p>
            <p className="text-3xl font-bold text-[#27ae60] mb-6 text-center">
              {lesson.price}
            </p>
            <button
              className="bg-[#27ae60] hover:bg-[#0056b3] text-white font-bold text-lg py-3 px-6 rounded-full w-full transition-colors duration-300"
              style={{
                whiteSpace: "nowrap", // Mantiene el texto del botón en una sola línea
              }}
            >
              {lesson.buttonLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DrivingLessons;
