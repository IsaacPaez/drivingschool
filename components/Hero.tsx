"use client";

import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="relative min-h-screen flex items-center px-6 md:px-12 pt-32 sm:pt-0 bg-no-repeat bg-center sm:bg-cover"
      style={{
        backgroundImage: "url('/BMW2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Imagen de fondo para pantallas grandes (como antes) */}
      <div className="absolute inset-0 hidden sm:block bg-cover bg-center" style={{ backgroundImage: "url('/8.jpg')" }}></div>
      {/* Fondo degradado oscuro para resaltar el texto, con menor opacidad */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent z-0" />

      {/* Contenido principal */}
      <div className="relative max-w-6xl mx-auto flex flex-col items-start text-left w-full z-10 pt-6 xl:pt-10 2xl:pt-0" style={{maxWidth: '1500px'}}>
        {/* Hero Text Mejorado */}
        <div className="w-full max-w-xl mb-8 mt-16 xl:mt-24 2xl:mt-0">
          <div className="px-8 py-10 rounded-xl shadow-2xl animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-2xl transition-all duration-500">
              <span className="block bg-gradient-to-r from-[#4CAF50] via-[#43e97b] to-[#38f9d7] bg-clip-text text-transparent animate-gradient-x">Learn To Drive</span>
              <span className="block mt-2">Safely For Life</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 font-medium mb-0 w-full max-w-xl drop-shadow-lg transition-all duration-500">
              Affordable Driving School offers professional <br className="hidden md:block" />
              Behind the Wheel Driving Lessons and Traffic <br className="hidden md:block" />
              School Courses in Palm Beach County.
            </p>
          </div>
        </div>
        {/* 📌 Contenedor de estadísticas (igual que antes) */}
        <div className="bg-white/30 backdrop-blur-sm shadow-lg rounded-lg px-8 py-4 mb-12 sm:mb-8 w-full max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h2 className="text-4xl font-bold text-black">
                9,000<span className="text-[#4CAF50]">+</span>
              </h2>
              <p className="text-lg text-black">Students</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-black">
                5,000<span className="text-[#4CAF50]">+</span>
              </h2>
              <p className="text-lg text-black">Lessons</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-black">
                30<span className="text-[#4CAF50]">+</span>
              </h2>
              <p className="text-lg text-black">Years of Experience</p>
            </div>
          </div>
        </div>
        {/* 📌 Botones */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mb-16 sm:mb-8">
          <Link
            href="/driving-lessons"
            className="bg-[#4CAF50] text-white text-lg sm:text-xl px-6 py-4 rounded-full border-white hover:bg-[#0056b3] text-center transition-all shadow-lg hover:shadow-xl"
          >
            Book Driving Lessons
          </Link>
          <Link
            href="/Classes"
            className="bg-[#4CAF50] text-white text-lg sm:text-xl px-6 py-4 rounded-full border-white hover:bg-[#0056b3] text-center transition-all shadow-lg hover:shadow-xl"
          >
            Book a Traffic Ticket Class
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
