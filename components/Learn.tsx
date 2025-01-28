"use client";

import React from "react";

const Learn = () => {
  const features = [
    {
      image: "/profe.jpg",
      title: "Experienced Instructors",
      description:
        "Our instructors are certified and have over 25 years of teaching experience in Palm Beach County. They stay up-to-date with the latest driving techniques.",
    },
    {
      image: "/L8jpg.jpg",
      title: "Affordable Prices",
      description:
        "We offer competitive rates for our driving lessons, and our multi-lesson packages offer discounts. Save up to $330!",
    },
    {
      image: "/L3.jpg",
      title: "Easy Bookings",
      description:
        "Booking and payment are quick and stress-free with our online booking system. Choose your instructor, date, and service, and you're ready to go!",
    },
    {
      image: "/certif.jpg",
      title: "Certified Traffic Courses",
      description:
        "We offer accredited Florida Traffic Courses, including the required First-Time Driver course and various Ticket and Driving Improvement Courses.",
    },
    {
      image: "/L5.jpg",
      title: "Personalized Driving Lessons",
      description:
        "We tailor lessons for beginners, teenagers, and experienced drivers. Each lesson is customized for the student's experience.",
    },
    {
      image: "/linea.jpg",
      title: "Online Learning Options",
      description:
        "We offer flexible learning options, including online Traffic Courses and DVD versions of our 4hr Basic Driving Improvement Course.",
    },
  ];

  return (
    <section className="bg-white pt-4 pb-16">
      {/* Ajustamos el margen del título para estar más arriba */}
      <h2 className="text-4xl font-extrabold text-black text-center mb-14">
        Why Learn With Us?
      </h2>
      {/* Ajustamos los cuadros para que ocupen más espacio */}
      <div className="grid grid-cols-3 grid-rows-2 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden shadow-lg group"
            style={{
              backgroundImage: `url(${feature.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "250px", // Mantiene proporción rectangular
              width: "100%", // Ajusta el ancho al contenedor
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-center text-white px-4">
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-sm">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Learn;
