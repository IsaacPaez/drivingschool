"use client";

import React from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import DrivingTestSection from "./DrivingTestSection";
import CorporatePrograms from "./CorporatePrograms";
import Link from "next/link";
import useDrivingLessons from "@/app/hooks/useDrivingLessons"; // Importación corregida

// Fuente moderna
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const LessonsPage = () => {
  const lessons = useDrivingLessons("Road Skills for Life");

  return (
    <section className={`${poppins.variable} bg-[#f5f5f5] py-24 px-8 relative`}>
      <div className="max-w-7xl mx-auto">
        {/* Contenedor principal de texto e imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
          {/* Texto con animaciones */}
          <div className="flex flex-col justify-between animate-fadeIn mt-20">
            <div className="space-y-6">
              <div className="hidden md:block text-left">
                <Link href="/Book-Now" passHref>
                  <div className="bg-[#0056b3] text-white font-semibold px-6 py-2 w-fit self-start rounded-full shadow-lg shadow-gray-700 hover:shadow-black hover:bg-[#27ae60] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                    Book Driving Lessons
                  </div>
                </Link>
              </div>

              <h2 className="text-6xl font-extrabold text-[#222] leading-tight">
                <span className="text-[#27ae60]">LEARN</span> ROAD <br />
                SKILLS <span className="text-[#0056b3]">FOR LIFE</span>
              </h2>
              <p className="text-lg text-black leading-relaxed">
                With over 25 years of experience, we go beyond preparing students
                for the DMV test. Our training covers real-world traffic
                scenarios, defensive driving, and high-speed highways like I-95.
              </p>

              {/* Segunda descripción agregada */}
              <p className="text-lg text-black leading-relaxed">
                We provide personalized lessons tailored for each student,
                ensuring they gain confidence behind the wheel while learning
                essential safety and defensive driving techniques.
              </p>

              {/* 📌 Nuevas líneas agregadas */}
              <ul className="space-y-3 text-lg font-semibold text-black">
                <li>
                  Nervous Driver or Parent?{" "}
                  <a href="#" className="text-[#27ae60] hover:underline">
                    Read More
                  </a>
                </li>
                <li>
                  Want to know more?{" "}
                  <a href="#" className="text-[#27ae60] hover:underline">
                    Read our FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Imagen con animación */}
          <div className="relative flex justify-center items-start mt-20">
            <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <Image
                src="/TPB.jpg"
                alt="Traffic in Palm Beach"
                width={400}
                height={320}
                className="rounded-2xl object-cover transition-all group-hover:scale-110"
              />
            </div>
          </div>
        </div>

        {/* Sección de Driving Lessons */}
        <div className="mt-14">
          {/* Grid para mostrar las lecciones correctamente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="p-6 bg-white rounded-xl shadow-md border border-gray-300 flex flex-col items-center">
                <h3 className="text-lg text-black font-semibold text-center">{lesson.title}</h3>
                <p className="text-sm text-black text-center">{lesson.description}</p>
                <p className="text-xl font-bold text-[#27ae60] text-center mt-2">
                  ${lesson.price}
                </p>
                {/* Contenedor flex para centrar el botón */}
                <div className="flex justify-center w-full mt-3">
                  <button className="bg-[#27ae60] text-white font-semibold px-6 py-2 w-fit self-start rounded-full shadow-lg shadow-gray-700 hover:shadow-black hover:bg-[#0056b3] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                    {lesson.buttonLabel || "Buy Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de Driving Test */}
      <DrivingTestSection />

      {/* Sección de Corporate Programs */}
      <CorporatePrograms />
    </section>
  );
};

export default LessonsPage;
