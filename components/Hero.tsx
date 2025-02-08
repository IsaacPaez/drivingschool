"use client";

import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="relative min-h-screen flex items-center px-6 md:px-12 pt-32 sm:pt-0 bg-no-repeat bg-center sm:bg-cover"
      style={{
        backgroundImage: "url('/BMW2.jpg')",
        backgroundSize: "cover", // Ajuste para evitar franjas negras
        backgroundPosition: "center", // Centrar correctamente
      }}
    >
      {/* Imagen de fondo para pantallas grandes */}
      <div className="absolute inset-0 hidden sm:block bg-cover bg-center" style={{ backgroundImage: "url('/8.jpg')" }}></div>

      {/* Contenido principal */}
      <div className="relative max-w-7xl mx-auto flex flex-col items-center lg:items-start text-center lg:text-left w-full">
        {/* ✅ Contenedor para móviles: Mantiene la descripción dentro de un cuadro */}
        <div className="w-full max-w-xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl mt-14 sm:mt-10 font-extrabold text-white leading-tight mb-6">
            Learn To Drive
            <br className="hidden md:block" /> Safely For Life
          </h1>

          {/* Contenedor de descripción SOLO en móviles */}
          <div className="bg-white/30 backdrop-blur-sm shadow-lg rounded-lg px-6 py-4 mb-8 sm:hidden">
            <p className="text-black text-base font-semibold text-center">
              Affordable Driving School offers professional Behind the Wheel
              Driving Lessons and Traffic School Courses in Palm Beach County.
            </p>
          </div>

          {/* Descripción NORMAL en pantallas grandes */}
          <p className="text-lg sm:text-xl text-white font-semibold mb-8 w-full max-w-xl hidden sm:block">
            Affordable Driving School offers professional{" "}
            <br className="hidden md:block" />
            Behind the Wheel Driving Lessons and Traffic{" "}
            <br className="hidden md:block" />
            School Courses in Palm Beach County.
          </p>
        </div>

        {/* 📌 Contenedor de estadísticas (SIEMPRE visible) */}
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
                2,000<span className="text-[#4CAF50]">+</span>
              </h2>
              <p className="text-lg text-black">Teachers</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-black">
                5,000<span className="text-[#4CAF50]">+</span>
              </h2>
              <p className="text-lg text-black">Lessons</p>
            </div>
          </div>
        </div>

        {/* 📌 Botones */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mb-16 sm:mb-8">
          <Link
            href="/Book-Now"
            className="bg-[#4CAF50] text-white text-lg sm:text-xl px-6 py-4 rounded-full border-white hover:bg-[#0056b3] text-center transition-all"
          >
            Book Driving Lessons
          </Link>
          <Link
            href="/Classes"
            className="bg-white text-[#4CAF50] text-lg sm:text-xl px-6 py-4 rounded-full border border-white hover:bg-[#0056b3] hover:text-white text-center transition-all"
          >
            Book a Traffic Ticket Class
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
