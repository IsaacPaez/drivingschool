"use client";

import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="relative bg-cover bg-center h-screen"
      style={{ backgroundImage: "url('/8.jpg')" }} // Asegúrate de que el path sea correcto
    >
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-start h-full">
        {/* Título */}
        <h1 className="text-5xl mt-8 font-extrabold text-white leading-tight mb-6">
          Learn To Drive Safely <br /> For Life
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-white font-semibold mb-8">
          Affordable Driving School offers professional<br /> Behind the Wheel Driving Lessons and Traffic <br />
          School Courses in Palm Beach County.
        </p>

        {/* Estadísticas */}
        <div className="flex space-x-10 mb-8">
          <div className="text-center">
            <h2 className="text-4xl text-black">9,000<span className="text-[#4CAF50]">+</span></h2>
            <p className="text-lg text-black">Students</p>
          </div>
          <div className="text-center">
            <h2 className="text-4xl text-black">2,000<span className="text-[#4CAF50]">+</span></h2>
            <p className="text-lg text-black">Teachers</p>
          </div>
          <div className="text-center">
            <h2 className="text-4xl text-black">5,000<span className="text-[#4CAF50]">+</span></h2>
            <p className="text-lg text-black">Lessons</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col space-y-4">
          <Link
            href="/book-driving-lessons"
            className="bg-[#4CAF50] text-white text-xl px-4 py-4 rounded-full border-white hover:bg-[#0056b3] text-center"
          >
            Book Driving Lessons
          </Link>
          <Link
            href="/book-traffic-ticket-class"
            className="bg-white text-[#4CAF50] text-lg px-12 py-4 rounded-full border border-white hover:bg-[#0056b3] hover:text-white text-center"
          >
            Book a Traffic Ticket Class
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
