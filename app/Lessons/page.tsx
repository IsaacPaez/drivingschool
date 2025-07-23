"use client";

import React from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import DrivingTestSection from "./DrivingTestSection";
import CorporatePrograms from "./CorporatePrograms";
import Link from "next/link";
import useDrivingLessons from "@/app/hooks/useDrivingLessons";
import AuthenticatedButton from "@/components/AuthenticatedButton";
import { motion } from "framer-motion";
import clsx from "clsx";

// Fuente moderna
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const LessonsPage = () => {
  const lessons = useDrivingLessons("Road Skills for Life");

  return (
    <section className={clsx(poppins.variable, "bg-[#f5f5f5] py-20 px-4 relative")}> 
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Contenedor principal de texto e imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-10">
          {/* Texto con animaciones */}
          <motion.div
            className="flex flex-col justify-between mt-20 md:mt-28"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="space-y-6">
              <div className="hidden md:block text-left">
                <Link href="/Book-Now" passHref>
                  <div className="bg-[#0056b3] text-white font-semibold px-6 py-2 w-fit self-start rounded-full shadow-lg shadow-gray-700 hover:shadow-black hover:bg-[#27ae60] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                    Book Driving Lessons
                  </div>
                </Link>
              </div>
              {/* Título con paleta profesional */}
              <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
                <span className="text-[#0056b3]">LEARN</span>{" "}
                <span className="text-black">ROAD SKILLS</span>{" "}
                <span className="text-[#27ae60]">FOR LIFE</span>
              </h2>
              <p className="text-lg text-black leading-relaxed">
                With over 25 years of experience, we go beyond preparing
                students for the DMV test. Our training covers real-world
                traffic scenarios, defensive driving, and high-speed highways
                like I-95.
              </p>
              <p className="text-lg text-black leading-relaxed">
                We provide personalized lessons tailored for each student,
                ensuring they gain confidence behind the wheel while learning
                essential safety and defensive driving techniques.
              </p>
              <ul className="space-y-3 text-lg font-semibold text-black">
                <li>
                  Nervous Driver or Parent?{" "}
                  <Link
                    href="/Article/Information-for-Nervous-Drivers-and-Parents"
                    className="text-[#27ae60] hover:underline"
                  >
                    Read More
                  </Link>
                </li>
                <li>
                  Want to know more?{" "}
                  <Link href="/FAQ" className="text-[#27ae60] hover:underline">
                    Read our FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
          {/* Imagen con animación */}
          <motion.div className="relative flex justify-center items-start mt-20 lg:mt-28" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all"
              style={{ width: 480, height: 600, maxWidth: '100%' }}
            >
              <Image
                src="/TPB.jpg"
                alt="Traffic in Palm Beach"
                width={480}
                height={600}
                className="rounded-2xl object-cover w-full h-full group-hover:scale-105 transition-all duration-500"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Sección de Driving Lessons */}
        <motion.div className="mt-10" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.25 }}>
          {/* Grid para mostrar las lecciones correctamente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {lessons.map((lesson) => {
              // Determinar si el botón es de tipo "book" o "buy" usando buttonLabel
              const isBooking = lesson.buttonLabel
                ?.toLowerCase()
                .includes("book");
              
              // Determinar si es un paquete basado en título, categoría o buttonLabel
              const isPackage = lesson.category === "Road Skills for Life" ||
                               lesson.title?.toLowerCase().includes("hour") ||
                               lesson.title?.toLowerCase().includes("pack") ||
                               (lesson.buttonLabel?.toLowerCase().includes("buy") && 
                                lesson.buttonLabel?.toLowerCase().includes("hour"));

              console.log(`🔍 Lesson: ${lesson.title}, isPackage: ${isPackage}, buttonLabel: ${lesson.buttonLabel}`);

              return (
                <div
                  key={lesson._id}
                  className="p-6 bg-white rounded-xl shadow-md border border-gray-300 flex flex-col items-center"
                >
                  <h3 className="text-lg text-black font-semibold text-center">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-black text-center">
                    {lesson.description}
                  </p>
                  
                  {/* Mostrar duración si está disponible */}
                  {lesson.duration && (
                    <p className="text-sm text-blue-600 font-semibold text-center mt-1">
                      {lesson.duration} Hours Package
                    </p>
                  )}
                  
                  <p className="text-xl font-bold text-[#27ae60] text-center mt-2">
                    ${lesson.price}
                  </p>
                  
                  {/* Mostrar indicador si es paquete */}
                  {isPackage && (
                    <p className="text-xs text-orange-600 font-bold text-center">
                      📅 Schedule with Calendly
                    </p>
                  )}
                  
                  {/* Contenedor flex para centrar el botón */}
                  <div className="flex justify-center w-full mt-3">
                    <AuthenticatedButton
                      type={isBooking ? "book" : "buy"}
                      actionData={{
                        itemId: lesson._id,
                        title: lesson.title,
                        price: lesson.price,
                        category: lesson.category, // Pasar categoría
                        duration: lesson.duration, // Pasar duración
                      }}
                      label={lesson.buttonLabel || "Add to Cart"}
                      className="w-full bg-[#27ae60] text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-black hover:bg-[#0056b3] hover:-translate-y-1 transition duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
        {/* Sección de Driving Test */}
        {/* <DrivingTestSection /> */}

      {/* Sección de Corporate Programs */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.3 }}>
        <CorporatePrograms />
      </motion.div>
      {/* CIERRE CORRECTO DEL motion.div PRINCIPAL */}
      </motion.div>
    </section>
  );
};

export default LessonsPage;
